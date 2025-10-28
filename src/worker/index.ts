import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createOpencodeClient } from "@opencode-ai/sdk/client";
import {
	CreateSessionRequestSchema,
	UpdateSessionRequestSchema,
	PromptRequestSchema,
	CommandRequestSchema,
	ShellRequestSchema,
	RevertRequestSchema,
	SummarizeRequestSchema,
	InitRequestSchema,
	PermissionResponseSchema,
	LogRequestSchema,
	TextSearchRequestSchema,
	FileSearchRequestSchema,
	SymbolSearchRequestSchema,
	FileReadRequestSchema,
	FileStatusRequestSchema,
	AuthSetRequestSchema,
} from "../types/opencode-schemas";

type Env = {
	OPENCODE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// Create OpenCode client (URL configured per environment in wrangler.jsonc)
function getOpencodeClient(env: Env) {
	return createOpencodeClient({
		baseUrl: env.OPENCODE_URL,
		throwOnError: false,
	});
}

// Standard error response helper
function createErrorResponse(error: unknown, context?: string) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorDetails = typeof error === 'object' && error !== null ? error : {};

	// Log error to Cloudflare observability
	console.error('[OpenCode API Error]', {
		context,
		message: errorMessage,
		error: errorDetails,
		timestamp: new Date().toISOString(),
	});

	return {
		error: {
			message: errorMessage,
			...errorDetails,
		},
	};
}

// Handler factory to reduce boilerplate
type OpencodeHandler<T = unknown> = (client: ReturnType<typeof getOpencodeClient>, context: any) => Promise<{ data?: T; error?: unknown }>;

function createHandler<T = unknown>(
	endpoint: string,
	handler: OpencodeHandler<T>
) {
	return async (c: any) => {
		const client = getOpencodeClient(c.env);
		const { data, error } = await handler(client, c);
		if (error) return c.json(createErrorResponse(error, endpoint), 500);
		return c.json({ data });
	};
}

// ========================================
// Health Check
// ========================================
app.get("/health", (c) => {
	return c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

// ========================================
// App APIs
// ========================================
app.post(
	"/api/opencode/app/log",
	zValidator("json", LogRequestSchema),
	createHandler("POST /api/opencode/app/log", async (client, c) => {
		const body = c.req.valid("json");
		return await client.app.log({ body });
	})
);

app.get(
	"/api/opencode/app/agents",
	createHandler("GET /api/opencode/app/agents", async (client) => {
		return await client.app.agents();
	})
);

// ========================================
// Project APIs
// ========================================
app.get(
	"/api/opencode/project/list",
	createHandler("GET /api/opencode/project/list", async (client) => {
		return await client.project.list();
	})
);

app.get(
	"/api/opencode/project/current",
	createHandler("GET /api/opencode/project/current", async (client) => {
		return await client.project.current();
	})
);

// ========================================
// Path APIs
// ========================================
app.get(
	"/api/opencode/path",
	createHandler("GET /api/opencode/path", async (client) => {
		return await client.path.get();
	})
);

// ========================================
// Config APIs
// ========================================
app.get(
	"/api/opencode/config",
	createHandler("GET /api/opencode/config", async (client) => {
		return await client.config.get();
	})
);

app.get(
	"/api/opencode/config/providers",
	createHandler("GET /api/opencode/config/providers", async (client) => {
		return await client.config.providers();
	})
);

// ========================================
// Session APIs
// ========================================
app.get(
	"/api/opencode/sessions",
	createHandler("GET /api/opencode/sessions", async (client) => {
		return await client.session.list();
	})
);

app.get(
	"/api/opencode/sessions/:id",
	createHandler("GET /api/opencode/sessions/:id", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.get({ path: { id } });
	})
);

app.get(
	"/api/opencode/sessions/:id/children",
	createHandler("GET /api/opencode/sessions/:id/children", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.children({ path: { id } });
	})
);

app.post(
	"/api/opencode/sessions",
	zValidator("json", CreateSessionRequestSchema),
	createHandler("POST /api/opencode/sessions", async (client, c) => {
		const body = c.req.valid("json");
		return await client.session.create({ body });
	})
);

app.delete(
	"/api/opencode/sessions/:id",
	createHandler("DELETE /api/opencode/sessions/:id", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.delete({ path: { id } });
	})
);

app.patch(
	"/api/opencode/sessions/:id",
	zValidator("json", UpdateSessionRequestSchema),
	createHandler("PATCH /api/opencode/sessions/:id", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.update({ path: { id }, body });
	})
);

app.post(
	"/api/opencode/sessions/:id/init",
	zValidator("json", InitRequestSchema),
	createHandler("POST /api/opencode/sessions/:id/init", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.init({ path: { id }, body });
	})
);

app.post(
	"/api/opencode/sessions/:id/abort",
	createHandler("POST /api/opencode/sessions/:id/abort", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.abort({ path: { id } });
	})
);

app.post(
	"/api/opencode/sessions/:id/share",
	createHandler("POST /api/opencode/sessions/:id/share", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.share({ path: { id } });
	})
);

app.post(
	"/api/opencode/sessions/:id/unshare",
	createHandler("POST /api/opencode/sessions/:id/unshare", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.unshare({ path: { id } });
	})
);

app.post(
	"/api/opencode/sessions/:id/summarize",
	zValidator("json", SummarizeRequestSchema),
	createHandler("POST /api/opencode/sessions/:id/summarize", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.summarize({ path: { id }, body });
	})
);

// ========================================
// Message APIs
// ========================================
app.get(
	"/api/opencode/sessions/:id/messages",
	createHandler("GET /api/opencode/sessions/:id/messages", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.messages({ path: { id } });
	})
);

app.get(
	"/api/opencode/sessions/:sessionId/messages/:messageId",
	createHandler("GET /api/opencode/sessions/:sessionId/messages/:messageId", async (client, c) => {
		const sessionId = c.req.param("sessionId");
		const messageId = c.req.param("messageId");
		return await client.session.message({ path: { id: sessionId, messageID: messageId } });
	})
);

app.post(
	"/api/opencode/sessions/:id/prompt",
	zValidator("json", PromptRequestSchema),
	createHandler("POST /api/opencode/sessions/:id/prompt", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.prompt({ path: { id }, body });
	})
);

app.post(
	"/api/opencode/sessions/:id/command",
	zValidator("json", CommandRequestSchema),
	createHandler("POST /api/opencode/sessions/:id/command", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.command({ path: { id }, body });
	})
);

app.post(
	"/api/opencode/sessions/:id/shell",
	zValidator("json", ShellRequestSchema),
	createHandler("POST /api/opencode/sessions/:id/shell", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.shell({ path: { id }, body });
	})
);

app.post(
	"/api/opencode/sessions/:id/revert",
	zValidator("json", RevertRequestSchema),
	createHandler("POST /api/opencode/sessions/:id/revert", async (client, c) => {
		const id = c.req.param("id");
		const body = c.req.valid("json");
		return await client.session.revert({ path: { id }, body });
	})
);

app.post(
	"/api/opencode/sessions/:id/unrevert",
	createHandler("POST /api/opencode/sessions/:id/unrevert", async (client, c) => {
		const id = c.req.param("id");
		return await client.session.unrevert({ path: { id } });
	})
);

app.post(
	"/api/opencode/sessions/:id/permissions/:permissionId",
	zValidator("json", PermissionResponseSchema),
	createHandler("POST /api/opencode/sessions/:id/permissions/:permissionId", async (client, c) => {
		const id = c.req.param("id");
		const permissionId = c.req.param("permissionId");
		const body = c.req.valid("json");
		return await client.postSessionIdPermissionsPermissionId({
			path: { id, permissionID: permissionId },
			body
		});
	})
);

// ========================================
// File Search APIs
// ========================================
app.post(
	"/api/opencode/find/text",
	zValidator("json", TextSearchRequestSchema),
	createHandler("POST /api/opencode/find/text", async (client, c) => {
		const query = c.req.valid("json");
		return await client.find.text({ query });
	})
);

app.post(
	"/api/opencode/find/files",
	zValidator("json", FileSearchRequestSchema),
	createHandler("POST /api/opencode/find/files", async (client, c) => {
		const query = c.req.valid("json");
		return await client.find.files({ query });
	})
);

app.post(
	"/api/opencode/find/symbols",
	zValidator("json", SymbolSearchRequestSchema),
	createHandler("POST /api/opencode/find/symbols", async (client, c) => {
		const query = c.req.valid("json");
		return await client.find.symbols({ query });
	})
);

// ========================================
// File APIs
// ========================================
app.post(
	"/api/opencode/file/read",
	zValidator("json", FileReadRequestSchema),
	createHandler("POST /api/opencode/file/read", async (client, c) => {
		const query = c.req.valid("json");
		return await client.file.read({ query });
	})
);

app.post(
	"/api/opencode/file/status",
	zValidator("json", FileStatusRequestSchema.optional()),
	createHandler("POST /api/opencode/file/status", async (client, c) => {
		const query = await c.req.json().catch(() => ({}));
		return await client.file.status({ query });
	})
);

// ========================================
// Auth APIs
// ========================================
app.post(
	"/api/opencode/auth/:providerId",
	zValidator("json", AuthSetRequestSchema),
	createHandler("POST /api/opencode/auth/:providerId", async (client, c) => {
		const providerId = c.req.param("providerId");
		const body = c.req.valid("json");
		return await client.auth.set({ path: { id: providerId }, body });
	})
);

// ========================================
// Event APIs (SSE)
// ========================================
app.get("/api/opencode/events", async (c) => {
	const client = getOpencodeClient();
	const result = await client.event.subscribe();

	// Forward SSE stream
	return new Response(result.stream as any, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
		},
	});
});

export default app;
