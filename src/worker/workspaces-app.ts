// Workspaces Hono App - Handles workspace management and routing

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getSandbox } from "@cloudflare/sandbox";
import {
	CreateWorkspaceRequestSchema,
	type CreateWorkspaceResponse,
	type ListWorkspacesResponse,
	type GetWorkspaceResponse,
	type DeleteWorkspaceResponse,
} from "../types/workspace-schemas";
import { proxyToWorkspaceSandbox } from "./utils/proxyToWorkspaceSandbox";
import { createErrorResponse } from "./utils/createErrorResponse";
import { getErrorStatusCode } from "./utils/getErrorStatusCode";
import { logger } from "../lib/logger";

// Store workspace metadata by workspace ID (in-memory for now)
export const workspaceMetadata = new Map<string, {
	repoUrl: string;
	branch: string;
	status: string;
	createdAt: string;
	opencodeUrl: string;
	containerWorkerProcessId?: string;
	opencodeProcessId?: string;
}>();

/**
 * Create a Hono app for workspace management
 * @returns Hono app with workspace routes
 */
const app = new Hono<{ Bindings: Env }>();

// ========================================
// Workspace Mode Proxy
// ========================================
// Proxy all /:workspaceId/opencode/* requests to the container worker
app.all("/:workspaceId/opencode/*", async (c) => {
	try {
		const workspaceId = c.req.param('workspaceId');
		const fullPath = c.req.path;

		// Extract everything after /api/workspaces/:workspaceId/opencode
		// The app is mounted at /api/workspaces, so fullPath includes that
		const prefix = `/api/workspaces/${workspaceId}/opencode`;
		const containerPath = fullPath.startsWith(prefix)
			? fullPath.substring(prefix.length) || '/'
			: '/';

		logger.debug(`[Workspace Proxy] ${c.req.method} ${containerPath} for workspace: ${workspaceId}`);

		// Special case: "local" workspace for dev mode
		// Proxy to /api/opencode which wraps responses properly
		if (workspaceId === "local") {
			// Make an internal request to /api/opencode
			// This ensures responses are wrapped in { data } format
			const opcodeApiPath = `/api/opencode${containerPath}`;
			const fullUrl = new URL(opcodeApiPath, c.req.url).toString();

			const response = await fetch(fullUrl, {
				method: c.req.method,
				headers: c.req.raw.headers,
				body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
			});

			return response;
		}

		// Proxy the request directly to the container worker running in the sandbox
		return await proxyToWorkspaceSandbox(c, workspaceId, containerPath, workspaceMetadata, c.env);
	} catch (error) {
		logger.error(`[Workspace Proxy] Error:`, error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "Workspace Proxy"), statusCode);
	}
});

// ========================================
// Workspace Management APIs
// ========================================

// Create a new workspace
app.post(
	"",
	zValidator("json", CreateWorkspaceRequestSchema),
	async (c) => {
		try {
			const { repoUrl, branch } = c.req.valid("json");

			// Generate workspace ID from repo URL and timestamp
			const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).substring(7)}`;

			logger.info(`[Workspace ${workspaceId}] Creating workspace for: ${repoUrl} (branch: ${branch})`);

			// Get sandbox instance
			const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

			// Clone repository using gitCheckout API
			await sandbox.gitCheckout(repoUrl, {
				branch,
				targetDir: '/workspace/repo'
			});

			logger.info(`[Workspace ${workspaceId}] Repository cloned successfully`);

			// Verify repository was cloned correctly
			const lsCheck = await sandbox.exec('ls -la /workspace/repo');
			logger.debug(`[Workspace ${workspaceId}] Repository contents:`, lsCheck.stdout?.substring(0, 500));

			// Start OpenCode server in the background
			// OpenCode will use cwd as the project directory
			logger.debug(`[Workspace ${workspaceId}] Starting OpenCode server in /workspace/repo...`);
			let opencodeProcessId: string | undefined;
			try {
				const opencodeProcess = await sandbox.startProcess('opencode serve --port 4096 --hostname 0.0.0.0', {
					cwd: '/workspace/repo',
					env: {
						PATH: '/usr/local/bin:/usr/bin:/bin',
						HOME: '/root',
						OPENCODE_PORT: '4096',
						OPENCODE_HOSTNAME: '0.0.0.0',
					},
				});
				opencodeProcessId = opencodeProcess.id;
				logger.info(`[Workspace ${workspaceId}] OpenCode server started successfully (PID: ${opencodeProcessId})`);
			} catch (opencodeError) {
				logger.error(`[Workspace ${workspaceId}] Failed to start OpenCode server:`, opencodeError);
				throw new Error(`Failed to start OpenCode server: ${opencodeError instanceof Error ? opencodeError.message : String(opencodeError)}`);
			}

			// Wait a moment for OpenCode to start
			await new Promise(resolve => setTimeout(resolve, 3000));

			// Check if OpenCode process is still running
			try {
				const opencodeStatus = await sandbox.getProcess(opencodeProcessId!);
				if (opencodeStatus) {
					logger.debug(`[Workspace ${workspaceId}] OpenCode process still running (PID: ${opencodeStatus.id})`);
					if (opencodeStatus.exitCode !== undefined) {
						logger.error(`[Workspace ${workspaceId}] OpenCode exited with code: ${opencodeStatus.exitCode}`);
					}
				} else {
					logger.error(`[Workspace ${workspaceId}] OpenCode process not found - it may have crashed!`);
				}
			} catch (statusError) {
				logger.error(`[Workspace ${workspaceId}] Failed to get OpenCode process status:`, statusError);
			}

			// Try to get OpenCode logs
			try {
				const logsCheck = await sandbox.exec(`ps aux | grep opencode | grep -v grep`);
				logger.debug(`[Workspace ${workspaceId}] OpenCode process check:`, logsCheck.stdout || "No opencode process found");
			} catch (e) {
				logger.error(`[Workspace ${workspaceId}] Failed to check OpenCode process:`, e);
			}

			// Verify OpenCode can see the repository files
			const pwdCheck = await sandbox.exec('curl -s http://localhost:4096/path');
			logger.debug(`[Workspace ${workspaceId}] OpenCode working directory check:`, pwdCheck.stdout?.substring(0, 300));

			// Start the container worker (Hono API) in the background
			// Worker files are baked into the Docker image at /opt/worker
			logger.debug(`[Workspace ${workspaceId}] Starting container worker...`);
			let containerWorkerProcessId: string | undefined;
			try {
				const workerProcess = await sandbox.startProcess('bun /opt/worker/container-worker.ts', {
					env: {
						PORT: '8080',
						PATH: '/usr/local/bin:/usr/bin:/bin',
						HOME: '/root',
					},
				});
				containerWorkerProcessId = workerProcess.id;
				logger.info(`[Workspace ${workspaceId}] Container worker started successfully (PID: ${containerWorkerProcessId})`);
			} catch (workerError) {
				logger.error(`[Workspace ${workspaceId}] Failed to start container worker:`, workerError);
				throw new Error(`Failed to start container worker: ${workerError instanceof Error ? workerError.message : String(workerError)}`);
			}

			// Wait for container worker to start
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Verify services are running before exposing port
			logger.debug(`[Workspace ${workspaceId}] Verifying services are running...`);

		// Check if OpenCode is responding
		const opcodeCheck = await sandbox.exec('sh -c \'curl -s http://localhost:4096/config || echo "FAILED"\'');
		logger.debug(`[Workspace ${workspaceId}] OpenCode health check:`, opcodeCheck.stdout?.substring(0, 200));
		if (opcodeCheck.stdout?.includes('FAILED')) {
			logger.error(`[Workspace ${workspaceId}] OpenCode is not responding!`);
			
			// Check OpenCode process status
			const opcodeProcessCheck = await sandbox.getProcess(opencodeProcessId!);
			if (opcodeProcessCheck) {
				logger.debug(`[Workspace ${workspaceId}] OpenCode process status: running=${!opcodeProcessCheck.exitCode}, exitCode=${opcodeProcessCheck.exitCode}`);
			} else {
				logger.error(`[Workspace ${workspaceId}] OpenCode process not found!`);
			}
		}

		// Check if container worker is responding
		const workerCheck = await sandbox.exec('sh -c \'curl -s http://localhost:8080/health || echo "FAILED"\'');
		logger.debug(`[Workspace ${workspaceId}] Container worker health check:`, workerCheck.stdout?.substring(0, 200));
		if (workerCheck.stdout?.includes('FAILED')) {
			logger.error(`[Workspace ${workspaceId}] Container worker is not responding!`);
			
			// Check worker process status
			const workerProcessCheck = await sandbox.getProcess(containerWorkerProcessId!);
			if (workerProcessCheck) {
				logger.debug(`[Workspace ${workspaceId}] Worker process status: running=${!workerProcessCheck.exitCode}, exitCode=${workerProcessCheck.exitCode}`);
			} else {
				logger.error(`[Workspace ${workspaceId}] Worker process not found!`);
			}
		}

		// Check what processes are running
		const psCheck = await sandbox.exec('sh -c \'ps aux | grep -E "opencode|bun" | grep -v grep\'');
		logger.debug(`[Workspace ${workspaceId}] Running processes:`, psCheck.stdout);
		
		// Check network connectivity
		const netstatCheck = await sandbox.exec('sh -c \'netstat -tlnp | grep -E "4096|8080" || echo "No listeners found"\'');
		logger.debug(`[Workspace ${workspaceId}] Network listeners:`, netstatCheck.stdout);
		
		// Try direct curl to container worker from inside container
		const workerCurlTest = await sandbox.exec('sh -c \'curl -v http://localhost:8080/opencode/config 2>&1 | head -30\'');
		logger.debug(`[Workspace ${workspaceId}] Direct curl to worker:`, workerCurlTest.stdout?.substring(0, 500));

			// Note: We use containerFetch for routing instead of exposePort
			// exposePort is optional and can be used for direct HTTP access if needed
			logger.info(`[Workspace ${workspaceId}] Container worker running on port 8080 (accessed via containerFetch)`);

			// Store workspace metadata including the container worker URL and process IDs
			const createdAt = new Date().toISOString();
			workspaceMetadata.set(workspaceId, {
				repoUrl,
				branch,
				status: "ready",
				createdAt,
				opencodeUrl: `http://localhost:8080`, // Container worker accessible via containerFetch
				containerWorkerProcessId,
				opencodeProcessId,
			});
			logger.info(`[Workspace ${workspaceId}] Metadata cached (Worker PID: ${containerWorkerProcessId}, OpenCode PID: ${opencodeProcessId})`);

			const response: CreateWorkspaceResponse = {
				id: workspaceId,
				status: "ready",
				repoUrl,
				branch,
				createdAt,
			};

			return c.json({ data: response }, 201);
		} catch (error) {
			logger.error('[Workspace Creation Error]', error);
			const statusCode = getErrorStatusCode(error);
			return c.json(createErrorResponse(error, "POST "), statusCode);
		}
	}
);

// List all workspaces
app.get("", async (c) => {
	try {
		const workspaces: GetWorkspaceResponse[] = [];

		// Add "local" workspace for dev mode (only if OPENCODE_URL is configured)
		if (c.env.OPENCODE_URL) {
			workspaces.push({
				id: "local",
				repoUrl: "local://dev",
				branch: "local",
				status: "ready",
				opencodeUrl: c.env.OPENCODE_URL,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		// Add sandbox workspaces from metadata
		for (const [id, metadata] of workspaceMetadata.entries()) {
			workspaces.push({
				id,
				repoUrl: metadata.repoUrl,
				branch: metadata.branch,
				status: metadata.status as any,
				opencodeUrl: metadata.opencodeUrl,
				createdAt: metadata.createdAt,
				updatedAt: metadata.createdAt,
			});
		}

		const response: ListWorkspacesResponse = {
			workspaces,
		};

		return c.json(response);
	} catch (error) {
		logger.error('[Workspace List Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET "), statusCode);
	}
});

// Get workspace details
app.get("/:id", async (c) => {
	try {
		const workspaceId = c.req.param("id");

		// Special case: "local" workspace for dev mode (only if OPENCODE_URL is configured)
		if (workspaceId === "local") {
			if (!c.env.OPENCODE_URL) {
				return c.json(
					{ error: 'Local workspace not available in production' },
					404
				);
			}
			const response: GetWorkspaceResponse = {
				id: "local",
				repoUrl: "local://dev",
				branch: "local",
				status: "ready",
				opencodeUrl: c.env.OPENCODE_URL,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			return c.json({ data: response });
		}

		// Get metadata for sandbox workspaces
		const metadata = workspaceMetadata.get(workspaceId);
		if (metadata) {
			const response: GetWorkspaceResponse = {
				id: workspaceId,
				repoUrl: metadata.repoUrl,
				branch: metadata.branch,
				status: metadata.status as any,
				opencodeUrl: metadata.opencodeUrl,
				createdAt: metadata.createdAt,
				updatedAt: metadata.createdAt,
			};
			return c.json({ data: response });
		}

		// Workspace not found
		return c.json(
			{ error: `Workspace ${workspaceId} not found` },
			404
		);
	} catch (error) {
		logger.error('[Workspace Get Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET /:id"), statusCode);
	}
});

// Delete workspace
app.delete("/:id", async (c) => {
	try {
		const workspaceId = c.req.param("id");

		// Clean up cached metadata
		workspaceMetadata.delete(workspaceId);

		// Note: Sandbox cleanup is handled automatically by Cloudflare
		// Just return success

		const response: DeleteWorkspaceResponse = {
			success: true,
			id: workspaceId,
		};

		return c.json({ data: response });
	} catch (error) {
		logger.error('[Workspace Delete Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "DELETE /:id"), statusCode);
	}
});

// Get workspace logs
app.get("/:id/logs", async (c) => {
	try {
		const workspaceId = c.req.param("id");
		const processType = c.req.query("process") || "worker"; // 'worker' or 'opencode'

		// Get metadata
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json(
				{ error: `Workspace ${workspaceId} not found` },
				404
			);
		}

		// Get the appropriate process ID
		const processId = processType === "opencode"
			? metadata.opencodeProcessId
			: metadata.containerWorkerProcessId;

		if (!processId) {
			return c.json(
				{ error: `Process ${processType} not found for workspace ${workspaceId}` },
				404
			);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Get process status and output
		const process = await sandbox.getProcess(processId);

		if (!process) {
			return c.json(
				{ error: `Process ${processId} not found` },
				404
			);
		}

		return c.json({
			data: {
				processId,
				processType,
				status: process.status,
				exitCode: process.exitCode,
				stdout: (process as any).stdout || "",
				stderr: (process as any).stderr || "",
			}
		});
	} catch (error) {
		logger.error('[Workspace Logs Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET /:id/logs"), statusCode);
	}
});

// Stage all changes in workspace
app.post("/:id/stage-all", async (c) => {
	try {
		const workspaceId = c.req.param("id");

		// Special case: "local" workspace for dev mode
		// Call the local git diff server (port 4097)
		if (workspaceId === "local") {
			try {
				const response = await fetch('http://127.0.0.1:4097/stage-all', {
					method: 'POST',
				});

				if (!response.ok) {
					throw new Error(`Git diff server responded with ${response.status}`);
				}

				const data = await response.json() as { success: boolean; message: string };

				return c.json({
					data: {
						success: data.success,
						message: data.message,
					}
				});
			} catch (err: any) {
				logger.error('[Local Stage All Error]', err.message);
				return c.json(
					{ error: `Failed to stage changes: ${err.message}` },
					500
				);
			}
		}

		// Get metadata for sandbox workspaces
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json(
				{ error: `Workspace ${workspaceId} not found` },
				404
			);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Run git add -A in the repository directory
		const result = await sandbox.exec('git add -A', {
			cwd: '/workspace/repo'
		});

		if (result.exitCode !== 0) {
			throw new Error(`git add failed: ${result.stderr}`);
		}

		return c.json({
			data: {
				success: true,
				message: 'All changes staged',
			}
		});
	} catch (error) {
		logger.error('[Workspace Stage All Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "POST /:id/stage-all"), statusCode);
	}
});

// Get workspace git diff
app.get("/:id/diff", async (c) => {
	try {
		const workspaceId = c.req.param("id");

		// Special case: "local" workspace for dev mode
		// Call the local git diff server (port 4097)
		if (workspaceId === "local") {
			try {
				const response = await fetch('http://127.0.0.1:4097/diff');

				if (!response.ok) {
					throw new Error(`Git diff server responded with ${response.status}`);
				}

				const data = await response.json() as { diff: string };
				const diff = data.diff || "";

				return c.json({
					data: {
						diff,
						workspaceId: "local",
					}
				});
			} catch (err: any) {
				logger.warn('[Local Diff Warning]', err.message);
				return c.json({
					data: {
						diff: "",
						workspaceId: "local",
					}
				});
			}
		}

		// Get metadata for sandbox workspaces
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json(
				{ error: `Workspace ${workspaceId} not found` },
				404
			);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Run git diff in the repository directory
		const result = await sandbox.exec('git diff HEAD', {
			cwd: '/workspace/repo'
		});

		const diff = result.stdout || "";

		return c.json({
			data: {
				diff,
				workspaceId,
			}
		});
	} catch (error) {
		logger.error('[Workspace Diff Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET /:id/diff"), statusCode);
	}
});

// Get git status for a workspace
app.get("/:id/status", async (c) => {
	try {
		const workspaceId = c.req.param('id');
		logger.info(`[Workspace ${workspaceId}] Getting git status`);

		// Special case: "local" workspace for dev mode
		if (workspaceId === "local") {
			// Call local git diff server
			const response = await fetch('http://127.0.0.1:4097/status');
			if (!response.ok) {
				throw new Error(`Git status server error: ${response.statusText}`);
			}
			const data = await response.json() as { status: string };
			return c.json({
				data: {
					status: data.status,
					workspaceId,
				}
			});
		}

		// Get metadata for sandbox workspaces
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json(
				{ error: `Workspace ${workspaceId} not found` },
				404
			);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Run git status in the repository directory
		const result = await sandbox.exec('git status --porcelain', {
			cwd: '/workspace/repo'
		});

		const status = result.stdout || "";

		return c.json({
			data: {
				status,
				workspaceId,
			}
		});
	} catch (error) {
		logger.error('[Workspace Status Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET /:id/status"), statusCode);
	}
});

// Stage a single file
app.post("/:id/stage", async (c) => {
	try {
		const workspaceId = c.req.param('id');
		const body = await c.req.json();
		const { filepath } = body;

		if (!filepath) {
			return c.json({ error: 'filepath is required' }, 400);
		}

		logger.info(`[Workspace ${workspaceId}] Staging file: ${filepath}`);

		// Special case: "local" workspace for dev mode
		if (workspaceId === "local") {
			const response = await fetch('http://127.0.0.1:4097/stage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filepath }),
			});
		if (!response.ok) {
			const error = await response.json() as { error?: string };
			throw new Error(error.error || 'Failed to stage file');
		}
			const data = await response.json();
			return c.json({ data });
		}

		// Get metadata for sandbox workspaces
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json(
				{ error: `Workspace ${workspaceId} not found` },
				404
			);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Stage the file
		await sandbox.exec(`git add "${filepath}"`, {
			cwd: '/workspace/repo'
		});

		return c.json({
			data: {
				success: true,
				message: `Staged ${filepath}`,
			}
		});
	} catch (error) {
		logger.error('[Workspace Stage Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "POST /:id/stage"), statusCode);
	}
});

// Unstage a single file
app.post("/:id/unstage", async (c) => {
	try {
		const workspaceId = c.req.param('id');
		const body = await c.req.json();
		const { filepath } = body;

		if (!filepath) {
			return c.json({ error: 'filepath is required' }, 400);
		}

		logger.info(`[Workspace ${workspaceId}] Unstaging file: ${filepath}`);

		// Special case: "local" workspace for dev mode
		if (workspaceId === "local") {
			const response = await fetch('http://127.0.0.1:4097/unstage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filepath }),
			});
		if (!response.ok) {
			const error = await response.json() as { error?: string };
			throw new Error(error.error || 'Failed to unstage file');
		}
		const data = await response.json();
		return c.json({ data });
		}

		// Get metadata for sandbox workspaces
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json(
				{ error: `Workspace ${workspaceId} not found` },
				404
			);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Unstage the file
		await sandbox.exec(`git restore --staged "${filepath}"`, {
			cwd: '/workspace/repo'
		});

		return c.json({
			data: {
				success: true,
				message: `Unstaged ${filepath}`,
			}
		});
	} catch (error) {
		logger.error('[Workspace Unstage Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "POST /:id/unstage"), statusCode);
	}
});

// ========================================
// Logs API - Retrieve container logs
// ========================================
app.get("/:workspaceId/logs", async (c) => {
	try {
		const workspaceId = c.req.param('workspaceId');
		logger.info(`[Workspace Logs] Fetching logs for workspace: ${workspaceId}`);

		// Get workspace metadata
		const metadata = workspaceMetadata.get(workspaceId);
		if (!metadata) {
			return c.json({ error: `Workspace ${workspaceId} not found` }, 404);
		}

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Read log files from /workspace/logs directory
		try {
			const result = await sandbox.exec('sh -c \'ls -la /workspace/logs && cat /workspace/logs/*.log 2>/dev/null || echo "No logs found"\'');

			return c.json({
				data: {
					workspaceId,
					logs: result.stdout || result.stderr || 'No output',
					exitCode: result.exitCode,
				}
			});
		} catch (error) {
			logger.error(`[Workspace Logs] Failed to read logs:`, error);
			return c.json({
				data: {
					workspaceId,
					logs: `Failed to read logs: ${error instanceof Error ? error.message : String(error)}`,
					exitCode: -1,
				}
			});
		}
	} catch (error) {
		logger.error('[Workspace Logs Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET /:workspaceId/logs"), statusCode);
	}
});

export default app;
