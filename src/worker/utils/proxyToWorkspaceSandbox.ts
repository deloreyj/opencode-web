import { getSandbox } from "@cloudflare/sandbox";

/**
 * Forward request to container worker (Hono API) running inside the sandbox
 * The container worker then calls the local OpenCode server at localhost:4096
 *
 * Uses Cloudflare's getSandbox and containerFetch to properly route to the exposed port
 *
 * @param c Hono context
 * @param workspaceId The workspace ID
 * @param path The path to forward to (e.g., "/session")
 * @param workspaceMetadata Map of workspace metadata
 * @param env Worker environment bindings
 * @returns Response from the container worker
 */
export async function proxyToWorkspaceSandbox(
	c: any,
	workspaceId: string,
	path: string,
	workspaceMetadata: Map<string, { opencodeUrl: string; [key: string]: any }>,
	env: any
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
	const sandbox = getSandbox(env.SANDBOX, workspaceId);

	// Construct the full URL with query params
	// containerFetch requires a full URL, so we use a dummy base
	const url = new URL(c.req.url);
	const targetUrl = new URL(path + url.search, 'http://localhost');
	console.log(`[proxyToWorkspaceSandbox] Target URL: ${targetUrl.toString()}`);

	try {
		// Use containerFetch to route to the exposed port (8080)
		// This method properly handles the routing without needing subdomain DNS resolution
		const response = await sandbox.containerFetch(
			targetUrl.toString(),
			{
				method: c.req.method,
				headers: c.req.raw.headers,
				body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
				// @ts-ignore - duplex is needed for streaming request bodies
				duplex: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? 'half' : undefined,
			},
			8080 // Port where container worker is running
		);

		console.log(`[proxyToWorkspaceSandbox] Response status: ${response.status}`);

		// Clone and log response for debugging (only in dev)
		if (process.env.NODE_ENV === 'development') {
			const clonedResponse = response.clone();
			try {
				const text = await clonedResponse.text();
				console.log(`[proxyToWorkspaceSandbox] Response preview:`, text.substring(0, 200));
			} catch (e) {
				console.log(`[proxyToWorkspaceSandbox] Could not read response for logging`);
			}
		}

		return response;
	} catch (error) {
		console.error(`[proxyToWorkspaceSandbox] Request failed:`, error);
		return new Response(
			JSON.stringify({ 
				error: `Failed to proxy request: ${error instanceof Error ? error.message : String(error)}` 
			}), 
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
