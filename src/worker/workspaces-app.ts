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

		console.log(`[Workspace Proxy] ${c.req.method} ${containerPath} for workspace: ${workspaceId}`);

		// Special case: "local" workspace for dev mode
		// Proxy directly to OPENCODE_URL (localhost:4096)
		if (workspaceId === "local") {
			const opcUrl = new URL(containerPath, c.env.OPENCODE_URL);

			const headers = new Headers(c.req.raw.headers);
			headers.delete('host');

			const response = await fetch(opcUrl.toString(), {
				method: c.req.method,
				headers,
				body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
			});

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		}

		// Proxy the request directly to the container worker running in the sandbox
		return await proxyToWorkspaceSandbox(c, workspaceId, containerPath, workspaceMetadata);
	} catch (error) {
		console.error(`[Workspace Proxy] Error:`, error);
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

			console.log(`[Workspace ${workspaceId}] Creating workspace for: ${repoUrl} (branch: ${branch})`);

			// Get sandbox instance
			const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

			// Clone repository using gitCheckout API
			await sandbox.gitCheckout(repoUrl, {
				branch,
				targetDir: '/workspace/repo'
			});

			console.log(`[Workspace ${workspaceId}] Repository cloned successfully`);

			// Configure OpenCode authentication before starting the server
			console.log(`[Workspace ${workspaceId}] Configuring OpenCode authentication...`);
			try {
				const token = c.env.OPENCODE_TOKEN || "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIyMmViNzc0MTQ4MWE4MzY4ODYzOTFjMjQwMjM5YTZjMDAzYmYzNzM0ZmIzNDk0ZTc5MjE1NmY2OWEyMGRkNTIifQ.eyJhdWQiOlsiN2VhMjYxZTliYzE4ZjE5OTkxMjJkMjNiNTY5ODhiZGE0ZTBiNzAwNTZmYjg3M2UzNWIzZTU5ZDQwMDdmYmVhNiJdLCJlbWFpbCI6ImpkZWxvcmV5QGNsb3VkZmxhcmUuY29tIiwiZXhwIjoxNzYxODUyNjczLCJpYXQiOjE3NjE3NjYyNzMsIm5iZiI6MTc2MTc2NjI3MywiaXNzIjoiaHR0cHM6Ly9ldGktaW5kaWEuY2xvdWRmbGFyZWFjY2Vzcy5jb20iLCJ0eXBlIjoiYXBwIiwiaWRlbnRpdHlfbm9uY2UiOiJYZERCRGEwQnRuQlAwQmpqIiwic3ViIjoiOWJhZjRlZDQtYTdlYS01YzI1LTgzZGEtYjZlZjIxODM4ZmNhIiwiZGV2aWNlX2lkIjoiMGM5M2Q1YTUtODhjNy0xMWYwLTk0OTAtMWFkOTQ5ZTUwMzcyIiwiY3VzdG9tIjp7ImVtYWlsIjoiamRlbG9yZXlAY2xvdWRmbGFyZS5jb20iLCJmaXJzdE5hbWUiOiJKYW1lcyIsImxhc3ROYW1lIjoiRGVsb3JleSIsImdyb3VwcyI6WyJBQ0wtQ0ZBLUdMT0JBTC1jbGlja2hvdXNlLXByb3h5IiwiQUNMLUNGQS1HTE9CQUwtc3NoIiwiQUNMLUNGQS1HTE9CQUwtVEVBTS13b3JrZXJzLWdyb3d0aCIsIkFDTC1DRkEtR0xPQkFMLVBQTC1FVkVSWU9ORSIsIkFDTC1DRkEtR0xPQkFMLWp3dC1nYXRld2F5IiwiQUNMLUNGQS1HTE9CQUwtUFBMLUVNUExPWUVFUyIsIkFDTC1DRkEtR0xPQkFMLVBQTC1FTVBMT1lFRVMtRVhDTFVERS1SSVNLIiwiQUNMLUNGQS1HTE9CQUwtUFBMLEVNUExPWUVFUy1FWENMVURFLUhJR0gtUklTSyJdfSwiY291bnRyeSI6IlBUIn0.fxQfFQga2PMcpV2ELWqij4gZnYi8d_FI9VS7Jse9Mp2slfRyhdCLXivPqMcwvhEbtoD1JZjOSPDnteLgllGuLoGhMOMY_J-DMGCM45yDKqANS9yEWOZ11tn_BNty-cO6ckKkkU5HKMb50ligf7J37R6rkXQs-8-ImdNj5lvEtlzA6oUzDfk5H0n0ajpzoW0ef9oocKUJrQ_wH3BzcPGlusgFYU4PZxQ3vsw1sYzz_RRg_ekgC4BgV_AaVHJ5pnEY5Tg3p6SawpKfmWjdjdHiCP3cS49ln6w83hkFeqDB9CIdNO4MoaNJFyVlV7QpZLYptCJVkZunzYZRw0ne9J3W5Q";

				// Auth file with the token
				const authJson = {
					"https://opencode.cloudflare.dev": {
						"type": "wellknown",
						"key": "TOKEN",
						"token": token
					}
				};

				// Config file with provider settings (from .well-known/opencode)
				const configJson = {
					"$schema": "https://opencode.ai/config.json",
					"share": "disabled",
					"disabled_providers": ["opencode"],
					"provider": {
						"anthropic": {
							"name": "Anthropic: Cloudflare AI Gateway",
							"options": {
								"baseURL": "https://opencode.cloudflare.dev/anthropic",
								"apiKey": "",
								"headers": {
									"cf-access-token": token
								}
							}
						},
						"openai": {
							"name": "OpenAI: Cloudflare AI Gateway",
							"options": {
								"baseURL": "https://opencode.cloudflare.dev/openai",
								"apiKey": "",
								"headers": {
									"cf-access-token": token
								}
							}
						}
					}
				};

				// Write files using base64 encoding to avoid quoting issues
				const authJsonStr = JSON.stringify(authJson, null, 2);
				const configJsonStr = JSON.stringify(configJson, null, 2);

				// Write JSON strings directly using exec with base64
				// Split into multiple simple commands to avoid shell complexity
				const authBase64 = Buffer.from(authJsonStr).toString('base64');
				const configBase64 = Buffer.from(configJsonStr).toString('base64');

				// Use a temporary script approach
				const writeScript = `#!/bin/sh
echo "${authBase64}" | base64 -d > /root/.local/share/opencode/auth.json
echo "${configBase64}" | base64 -d > /root/.config/opencode/config.json
`;
				await sandbox.exec('sh', {
					args: ['-c', writeScript]
				});

				// Verify files were written
				const authCheck = await sandbox.exec('ls', {
					args: ['-la', '/root/.local/share/opencode/auth.json']
				});
				const configCheck = await sandbox.exec('ls', {
					args: ['-la', '/root/.config/opencode/config.json']
				});
				console.log(`[Workspace ${workspaceId}] Auth file check:`, authCheck.stdout || authCheck.stderr);
				console.log(`[Workspace ${workspaceId}] Config file check:`, configCheck.stdout || configCheck.stderr);
				console.log(`[Workspace ${workspaceId}] OpenCode authentication configured successfully`);
			} catch (authError) {
				console.error(`[Workspace ${workspaceId}] Error configuring OpenCode authentication:`, authError);
				console.error(`[Workspace ${workspaceId}] Error details:`, JSON.stringify(authError, null, 2));
			}

			// Start OpenCode server in the background
			console.log(`[Workspace ${workspaceId}] Starting OpenCode server...`);
			let opencodeProcessId: string | undefined;
			try {
				const opencodeProcess = await sandbox.startProcess('opencode serve --port 4096', {
					cwd: '/workspace/repo',
					env: {
						PATH: '/usr/local/bin:/usr/bin:/bin',
						HOME: '/root',
					},
				});
				opencodeProcessId = opencodeProcess.id;
				console.log(`[Workspace ${workspaceId}] OpenCode server started successfully (PID: ${opencodeProcessId})`);
			} catch (opencodeError) {
				console.error(`[Workspace ${workspaceId}] Failed to start OpenCode server:`, opencodeError);
				throw new Error(`Failed to start OpenCode server: ${opencodeError instanceof Error ? opencodeError.message : String(opencodeError)}`);
			}

			// Wait a moment for OpenCode to start
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Start the container worker (Hono API) in the background
			// Worker files are baked into the Docker image at /opt/worker
			console.log(`[Workspace ${workspaceId}] Starting container worker...`);
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
				console.log(`[Workspace ${workspaceId}] Container worker started successfully (PID: ${containerWorkerProcessId})`);
			} catch (workerError) {
				console.error(`[Workspace ${workspaceId}] Failed to start container worker:`, workerError);
				throw new Error(`Failed to start container worker: ${workerError instanceof Error ? workerError.message : String(workerError)}`);
			}

			// Wait for container worker to start
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Expose the container worker port (8080, not OpenCode port)
			// This is the API that clients will connect to
			const result = await sandbox.exposePort(8080, {
				hostname: c.env.SANDBOX_HOSTNAME
			});

			console.log(`[Workspace ${workspaceId}] Container worker exposed at: ${result.url}`);

			// Store workspace metadata including the container worker URL and process IDs
			const createdAt = new Date().toISOString();
			workspaceMetadata.set(workspaceId, {
				repoUrl,
				branch,
				status: "ready",
				createdAt,
				opencodeUrl: result.url, // This is now the container worker URL (port 8080)
				containerWorkerProcessId,
				opencodeProcessId,
			});
			console.log(`[Workspace ${workspaceId}] Metadata cached for future requests (URL: ${result.url}, Worker PID: ${containerWorkerProcessId}, OpenCode PID: ${opencodeProcessId})`);

			const response: CreateWorkspaceResponse = {
				id: workspaceId,
				status: "ready",
				repoUrl,
				branch,
				createdAt,
			};

			return c.json({ data: response }, 201);
		} catch (error) {
			console.error('[Workspace Creation Error]', error);
			const statusCode = getErrorStatusCode(error);
			return c.json(createErrorResponse(error, "POST "), statusCode);
		}
	}
);

// List all workspaces
app.get("", async (c) => {
	try {
		const workspaces: GetWorkspaceResponse[] = [];

		// Add "local" workspace for dev mode
		workspaces.push({
			id: "local",
			repoUrl: "local://dev",
			branch: "local",
			status: "ready",
			opencodeUrl: c.env.OPENCODE_URL,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

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
		console.error('[Workspace List Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET "), statusCode);
	}
});

// Get workspace details
app.get("/:id", async (c) => {
	try {
		const workspaceId = c.req.param("id");

		// Get sandbox instance
		const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

		// Try to get OpenCode URL if exposed
		let opencodeUrl: string | undefined;
		try {
			const { url } = await sandbox.exposePort(4096, {
				hostname: c.env.SANDBOX_HOSTNAME
			});
			opencodeUrl = url;
		} catch (err) {
			// Port might not be exposed yet
			opencodeUrl = undefined;
		}

		const response: GetWorkspaceResponse = {
			id: workspaceId,
			repoUrl: "unknown", // TODO: Store workspace metadata
			branch: "main",
			status: opencodeUrl ? "ready" : "initializing",
			opencodeUrl,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return c.json({ data: response });
	} catch (error) {
		console.error('[Workspace Get Error]', error);
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
		console.error('[Workspace Delete Error]', error);
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

		return c.json({
			data: {
				processId,
				processType,
				status: process.status,
				exitCode: process.exitCode,
				stdout: process.stdout || "",
				stderr: process.stderr || "",
			}
		});
	} catch (error) {
		console.error('[Workspace Logs Error]', error);
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
				console.error('[Local Stage All Error]', err.message);
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
		const result = await sandbox.exec('git', {
			args: ['add', '-A'],
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
		console.error('[Workspace Stage All Error]', error);
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
				console.warn('[Local Diff Warning]', err.message);
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
		const result = await sandbox.exec('git', {
			args: ['diff', 'HEAD'],
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
		console.error('[Workspace Diff Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "GET /:id/diff"), statusCode);
	}
});

// Get git status for a workspace
app.get("/:id/status", async (c) => {
	try {
		const workspaceId = c.req.param('id');
		console.log(`[Workspace ${workspaceId}] Getting git status`);

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
		const result = await sandbox.exec('git', {
			args: ['status', '--porcelain'],
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
		console.error('[Workspace Status Error]', error);
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

		console.log(`[Workspace ${workspaceId}] Staging file: ${filepath}`);

		// Special case: "local" workspace for dev mode
		if (workspaceId === "local") {
			const response = await fetch('http://127.0.0.1:4097/stage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filepath }),
			});
			if (!response.ok) {
				const error = await response.json();
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
		await sandbox.exec('git', {
			args: ['add', filepath],
			cwd: '/workspace/repo'
		});

		return c.json({
			data: {
				success: true,
				message: `Staged ${filepath}`,
			}
		});
	} catch (error) {
		console.error('[Workspace Stage Error]', error);
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

		console.log(`[Workspace ${workspaceId}] Unstaging file: ${filepath}`);

		// Special case: "local" workspace for dev mode
		if (workspaceId === "local") {
			const response = await fetch('http://127.0.0.1:4097/unstage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filepath }),
			});
			if (!response.ok) {
				const error = await response.json();
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
		await sandbox.exec('git', {
			args: ['restore', '--staged', filepath],
			cwd: '/workspace/repo'
		});

		return c.json({
			data: {
				success: true,
				message: `Unstaged ${filepath}`,
			}
		});
	} catch (error) {
		console.error('[Workspace Unstage Error]', error);
		const statusCode = getErrorStatusCode(error);
		return c.json(createErrorResponse(error, "POST /:id/unstage"), statusCode);
	}
});

export default app;
