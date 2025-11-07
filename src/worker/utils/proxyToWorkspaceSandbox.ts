// Note: Not using proxyToSandbox or containerFetch as they have issues in local dev
// Instead, we'll fetch the exposed URL directly

/**
 * Forward request to container worker (Hono API) running inside the sandbox
 * The container worker then calls the local OpenCode server at localhost:4096
 *
 * Uses Cloudflare's proxyToSandbox helper which properly handles routing to exposed ports
 *
 * @param c Hono context
 * @param workspaceId The workspace ID
 * @param path The path to forward to (e.g., "/session")
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

	// Construct the full URL by combining the exposed URL base with our path
	const url = new URL(c.req.url);
	const exposedUrl = metadata.opencodeUrl;
	console.log(`[proxyToWorkspaceSandbox] Exposed URL from metadata: ${exposedUrl}`);

	const targetUrl = new URL(path + url.search, exposedUrl);
	console.log(`[proxyToWorkspaceSandbox] Target URL: ${targetUrl.toString()}`);

	// Directly fetch the exposed URL
	// This works because exposePort() makes the port accessible via HTTP
	console.log(`[proxyToWorkspaceSandbox] Fetching directly from exposed URL...`);

	try {
		const response = await fetch(targetUrl.toString(), {
			method: c.req.method,
			headers: c.req.raw.headers,
			body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? c.req.raw.body : undefined,
			// @ts-ignore - duplex is needed for streaming request bodies
			duplex: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? 'half' : undefined,
		});

		console.log(`[proxyToWorkspaceSandbox] Fetch completed`);
		console.log(`[proxyToWorkspaceSandbox] Response status: ${response.status}`);

		// Clone and log response for debugging
		const clonedResponse = response.clone();
		try {
			const text = await clonedResponse.text();
			console.log(`[proxyToWorkspaceSandbox] Response body preview (first 500 chars):`, text.substring(0, 500));

			// Try to parse as JSON to check structure
			try {
				const json = JSON.parse(text);
				console.log(`[proxyToWorkspaceSandbox] Response has 'data' key:`, 'data' in json);
				console.log(`[proxyToWorkspaceSandbox] Response has 'error' key:`, 'error' in json);
				if ('data' in json) {
					console.log(`[proxyToWorkspaceSandbox] Data type:`, typeof json.data);
					if (Array.isArray(json.data)) {
						console.log(`[proxyToWorkspaceSandbox] Data is array with length:`, json.data.length);
					}
				}
			} catch (e) {
				console.log(`[proxyToWorkspaceSandbox] Response is not JSON`);
			}
		} catch (e) {
			console.log(`[proxyToWorkspaceSandbox] Could not read response body for logging:`, e);
		}

		return response;
	} catch (error) {
		console.error(`[proxyToWorkspaceSandbox] Fetch failed:`, error);
		return new Response(JSON.stringify({ error: `Failed to proxy request: ${error instanceof Error ? error.message : String(error)}` }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
