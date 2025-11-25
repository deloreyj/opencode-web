// Main Cloudflare Worker
// Entry point that mounts OpenCode API and workspace management routes

import { Hono } from "hono";
import { env } from 'cloudflare:workers';
import { Sandbox } from "@cloudflare/sandbox";
import { newWorkersRpcResponse } from "capnweb";
import { createOpencodeApp } from "./opencode-app";
import WorkspacesApp from "./workspaces-app";
import { OpencodeRpcServer } from "./opencode-rpc-server";

const app = new Hono<{ Bindings: Env }>();

// ========================================
// Mount OpenCode App for Direct Mode
// ========================================
// Direct mode: /api/opencode/* → local OpenCode server (OPENCODE_URL)
const opencodeApp = createOpencodeApp({
	opencodeBaseUrl: env.OPENCODE_URL, // If this is defined, we'll auto-configure a local workspace
});
app.route("/api/opencode", opencodeApp);

// ========================================
// Mount OpenCode RPC Endpoint (Direct Mode)
// ========================================
// Cap'n Web RPC endpoint for direct mode
app.all("/api/opencode-rpc", (c) => {
	return newWorkersRpcResponse(c.req.raw, new OpencodeRpcServer(env.OPENCODE_URL));
});

// ========================================
// Mount Workspaces App
// ========================================
// Workspace mode: /api/workspaces/* → workspace management and proxy to sandbox
app.route("/api/workspaces", WorkspacesApp);

// Export Sandbox class for Durable Object binding
export { Sandbox };

// Export the Hono app as the default worker
export default app;
