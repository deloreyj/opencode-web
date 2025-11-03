// Main Cloudflare Worker
// Entry point that mounts OpenCode API and workspace management routes

import { Hono } from "hono";
import { env } from 'cloudflare:workers';
import { Sandbox } from "@cloudflare/sandbox";
import { createOpencodeApp } from "./opencode-app";
import WorkspacesApp from "./workspaces-app";

const app = new Hono<{ Bindings: Env }>();

// ========================================
// Mount OpenCode App for Direct Mode
// ========================================
// Direct mode: /api/opencode/* → local OpenCode server (OPENCODE_URL)
const opencodeApp = createOpencodeApp({
	opencodeBaseUrl: env.OPENCODE_URL,
});
app.route("/api/opencode", opencodeApp);

// ========================================
// Mount Workspaces App
// ========================================
// Workspace mode: /api/workspaces/* → workspace management and proxy to sandbox
app.route("/api/workspaces", WorkspacesApp);

// Export Sandbox class for Durable Object binding
export { Sandbox };

// Export the Hono app as the default worker
export default app;
