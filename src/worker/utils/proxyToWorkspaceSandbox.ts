import { getSandbox } from "@cloudflare/sandbox";

/**
 * Forward request to container worker (Hono API) running inside the sandbox
 * The container worker then calls the local OpenCode server at localhost:4096
 *
 * @param c Hono context
 * @param workspaceId The workspace ID
 * @param path The path to forward to (e.g., "/api/opencode/sessions")
 * @param workspaceMetadata Map of workspace metadata
 * @returns Response from the container worker
 */
export async function proxyToWorkspaceSandbox(
	c: any,
	workspaceId: string,
	path: string,
	workspaceMetadata: Map<string, { opencodeUrl: string; [key: string]: any }>
): Promise<Response> {
	// Verify workspace exists
	const metadata = workspaceMetadata.get(workspaceId);
	if (!metadata) {
		return c.json(
			{
				error: `Workspace ${workspaceId} not found. Please create the workspace first via POST /api/workspaces.`,
			},
			404
		);
	}

	console.log(`[proxyToWorkspaceSandbox] Proxying to workspace ${workspaceId}, path: ${path}`);

	// Get the sandbox instance
	const sandbox = getSandbox(c.env.SANDBOX, workspaceId);

	// Build the proxy request targeting localhost:8080 inside the container
	// This is where our container worker (Hono app) is listening
	const url = new URL(c.req.url);
	const proxyUrl = `http://localhost:8080${path}${url.search}`;

	console.log(`[proxyToWorkspaceSandbox] Container internal URL: ${proxyUrl}`);

	// Create proxy request with proper headers
	const proxyRequest = new Request(proxyUrl, {
		method: c.req.method,
		headers: {
			...Object.fromEntries(c.req.raw.headers.entries()),
			'X-Original-URL': c.req.url,
			'X-Forwarded-Host': url.hostname,
			'X-Forwarded-Proto': url.protocol.replace(':', ''),
			'X-Workspace-Id': workspaceId,
		},
		body: c.req.raw.body,
		// @ts-ignore - duplex is needed for streaming request bodies
		duplex: 'half',
	});

	console.log(`[proxyToWorkspaceSandbox] Request method: ${proxyRequest.method}`);

	// Use containerFetch to route the request to port 8080 inside the container
	const response = await sandbox.containerFetch(proxyRequest, 8080);

	console.log(`[proxyToWorkspaceSandbox] Response status: ${response.status}`);

	return response;
}
