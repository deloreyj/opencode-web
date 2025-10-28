import { Hono } from "hono";
import { env } from 'cloudflare:workers';
import { zValidator } from "@hono/zod-validator";
import { createOpencodeClient } from "@opencode-ai/sdk/client";
import { z } from "zod";
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

const app = new Hono<{ Bindings: Env }>();

// Create OpenCode client (URL configured per environment in wrangler.jsonc)
function getOpencodeClient() {
	return createOpencodeClient({
		baseUrl: env.OPENCODE_URL,
		throwOnError: false,
	});
}

// Standard error response helper
function createErrorResponse(error: unknown, context?: string) {
	let errorMessage: string;
	let errorDetails: any = {};

	// Format Zod validation errors nicely
	if (error instanceof z.ZodError) {
		const fieldErrors = error.errors.map(err => {
			const path = err.path.join('.');
			return `${path}: ${err.message}`;
		});

		errorMessage = fieldErrors.length === 1
			? fieldErrors[0]
			: `Validation failed: ${fieldErrors.join(', ')}`;

		errorDetails = {
			validationErrors: error.errors.map(err => ({
				field: err.path.join('.'),
				message: err.message,
				code: err.code,
			})),
		};
	} else {
		errorMessage = error instanceof Error ? error.message : String(error);
		errorDetails = typeof error === 'object' && error !== null ? error : {};
	}

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

// Determine appropriate HTTP status code from error
function getErrorStatusCode(error: unknown): number {
	// Zod validation errors
	if (error instanceof z.ZodError) {
		return 400;
	}

	if (typeof error === 'object' && error !== null) {
		const err = error as any;

		// Check for explicit status code
		if (typeof err.status === 'number') {
			return err.status;
		}

		// Check for HTTP status in response
		if (typeof err.response?.status === 'number') {
			return err.response.status;
		}

		// Infer from error message/type
		const message = (err.message || '').toLowerCase();

		// Validation errors
		if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
			return 400;
		}

		// Not found errors
		if (message.includes('not found') || message.includes('does not exist')) {
			return 404;
		}

		// Authentication/Authorization errors
		if (message.includes('unauthorized') || message.includes('authentication')) {
			return 401;
		}

		if (message.includes('forbidden') || message.includes('permission')) {
			return 403;
		}
	}

	// Default to 500 for unknown errors
	return 500;
}

// Handler factory to reduce boilerplate
type OpencodeHandler<T = unknown> = (client: ReturnType<typeof getOpencodeClient>, context: any) => Promise<{ data?: T; error?: unknown }>;

function createHandler<T = unknown>(
	endpoint: string,
	handler: OpencodeHandler<T>
) {
	return async (c: any) => {
		const client = getOpencodeClient();
		const { data, error } = await handler(client, c);
		if (error) {
			const statusCode = getErrorStatusCode(error);
			return c.json(createErrorResponse(error, endpoint), statusCode);
		}
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
app.get("/api/opencode/event", async (c) => {
	try {
		console.log('[OpenCode SSE] Client connecting to events endpoint');

		const client = getOpencodeClient();
		const result = await client.event.subscribe();

		// Check if stream exists
		if (!result.stream) {
			console.error('[OpenCode SSE] No stream in result');
			return new Response(
				`data: ${JSON.stringify({ error: 'No stream available' })}\n\n`,
				{
					status: 500,
					headers: {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						'Connection': 'keep-alive',
					},
				}
			);
		}

		console.log('[OpenCode SSE] Converting AsyncGenerator to ReadableStream');

		// Convert AsyncGenerator to ReadableStream
		// The SDK returns an AsyncGenerator, not a ReadableStream
		// We need to iterate over it and format as SSE
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				try {
					console.log('[OpenCode SSE] Starting stream iteration');
					for await (const event of result.stream) {
						console.log('[OpenCode SSE] Received event:', event.type);
						// Format as SSE: data: {json}\n\n
						const data = `data: ${JSON.stringify(event)}\n\n`;
						controller.enqueue(encoder.encode(data));
					}
					console.log('[OpenCode SSE] Stream completed');
					controller.close();
				} catch (error) {
					console.error('[OpenCode SSE] Stream error:', error);
					controller.error(error);
				}
			},
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
			},
		});
	} catch (error) {
		console.error('[OpenCode SSE] Failed to establish SSE connection:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			timestamp: new Date().toISOString(),
		});

		// Return error response for SSE connection failures
		return new Response(
			`data: ${JSON.stringify({ error: 'Failed to connect to OpenCode events' })}\n\n`,
			{
				status: 500,
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive',
				},
			}
		);
	}
});

export default app;
