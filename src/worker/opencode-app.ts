// Shared Hono App - Used by both Cloudflare Worker and Container Worker
// This module exports a factory function that creates the Hono app with all OpenCode routes

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createOpencodeClient } from "@opencode-ai/sdk/client";
import { createErrorResponse } from "./utils/createErrorResponse";
import { getErrorStatusCode } from "./utils/getErrorStatusCode";
import {
	CreateSessionRequestSchema,
	UpdateSessionRequestSchema,
	PromptRequestSchema,
	CommandRequestSchema,
	ShellRequestSchema,
	RevertRequestSchema,
	SummarizeRequestSchema,
	InitRequestSchema,
	LogRequestSchema,
} from "../types/opencode-schemas";

// Configuration for creating the app
export interface AppConfig {
	opencodeBaseUrl: string; // URL to the OpenCode server (e.g., "http://localhost:4096")
}

// Handler factory to reduce boilerplate
type OpencodeHandler<T = unknown> = (client: ReturnType<typeof createOpencodeClient>, context: any) => Promise<{ data?: T; error?: unknown }>;

function createHandler<T = unknown>(
	endpoint: string,
	handler: OpencodeHandler<T>,
	opencodeClient: ReturnType<typeof createOpencodeClient>
) {
	return async (c: any) => {
		console.log(`[${endpoint}] Request received`);
		const { data, error } = await handler(opencodeClient, c);
		if (error) {
			console.error(`[${endpoint}] Error occurred`, error);
			const statusCode = getErrorStatusCode(error);
			return c.json(createErrorResponse(error, endpoint), statusCode);
		}
		console.log(`[${endpoint}] Success, wrapping data in response`, {
			dataType: Array.isArray(data) ? `array[${data.length}]` : typeof data,
		});
		return c.json({ data });
	};
}

/**
 * Create a Hono app with all OpenCode API routes
 * @param config Configuration for the app (OpenCode base URL)
 * @returns Hono app instance
 */
export function createOpencodeApp(config: AppConfig) {
	const app = new Hono();

	// Create OpenCode client
	const opencodeClient = createOpencodeClient({
		baseUrl: config.opencodeBaseUrl,
		throwOnError: false,
	});

	// Utility to create a handler with the client bound
	const handler = <T = unknown>(endpoint: string, fn: OpencodeHandler<T>) =>
		createHandler(endpoint, fn, opencodeClient);

	// ========================================
	// App APIs
	// ========================================
	app.post(
		"/app/log",
		zValidator("json", LogRequestSchema),
		handler("POST /app/log", async (client, c) => {
			const body = c.req.valid("json");
			return await client.app.log({ body });
		})
	);

	app.get(
		"/app/agents",
		handler("GET /app/agents", async (client) => {
			return await client.app.agents();
		})
	);

	// ========================================
	// Project APIs
	// ========================================
	app.get(
		"/project/list",
		handler("GET /project/list", async (client) => {
			return await client.project.list();
		})
	);

	app.get(
		"/project/current",
		handler("GET /project/current", async (client) => {
			return await client.project.current();
		})
	);

	// ========================================
	// Path APIs
	// ========================================
	app.get(
		"/path",
		handler("GET /path", async (client) => {
			return await client.path.get();
		})
	);

	// ========================================
	// Config APIs
	// ========================================
	app.get(
		"/config",
		handler("GET /config", async (client) => {
			return await client.config.get();
		})
	);

	app.get(
		"/config/providers",
		handler("GET /config/providers", async (client) => {
			return await client.config.providers();
		})
	);

	// ========================================
	// Session APIs
	// ========================================
	app.get(
		"/session",
		handler("GET /session", async (client) => {
			return await client.session.list();
		})
	);

	app.post(
		"/session",
		zValidator("json", CreateSessionRequestSchema),
		handler("POST /session", async (client, c) => {
			const body = c.req.valid("json");
			return await client.session.create({ body });
		})
	);

	app.get(
		"/session/:id",
		handler("GET /session/:id", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.get({ path: { id } });
		})
	);

	app.get(
		"/session/:id/children",
		handler("GET /session/:id/children", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.children({ path: { id } });
		})
	);

	app.patch(
		"/session/:id",
		zValidator("json", UpdateSessionRequestSchema),
		handler("PATCH /session/:id", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.update({ path: { id }, body });
		})
	);

	app.delete(
		"/session/:id",
		handler("DELETE /session/:id", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.delete({ path: { id } });
		})
	);

	app.post(
		"/session/:id/init",
		zValidator("json", InitRequestSchema),
		handler("POST /session/:id/init", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.init({ path: { id }, body });
		})
	);

	app.post(
		"/session/:id/prompt",
		zValidator("json", PromptRequestSchema),
		handler("POST /session/:id/prompt", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.prompt({ path: { id }, body });
		})
	);

	app.post(
		"/session/:id/command",
		zValidator("json", CommandRequestSchema),
		handler("POST /session/:id/command", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.command({ path: { id }, body });
		})
	);

	app.post(
		"/session/:id/shell",
		zValidator("json", ShellRequestSchema),
		handler("POST /session/:id/shell", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.shell({ path: { id }, body });
		})
	);

	app.post(
		"/session/:id/revert",
		zValidator("json", RevertRequestSchema),
		handler("POST /session/:id/revert", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.revert({ path: { id }, body });
		})
	);

	app.post(
		"/session/:id/unrevert",
		handler("POST /session/:id/unrevert", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.unrevert({ path: { id } });
		})
	);

	app.post(
		"/session/:id/abort",
		handler("POST /session/:id/abort", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.abort({ path: { id } });
		})
	);

	app.post(
		"/session/:id/share",
		handler("POST /session/:id/share", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.share({ path: { id } });
		})
	);

	app.post(
		"/session/:id/unshare",
		handler("POST /session/:id/unshare", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.unshare({ path: { id } });
		})
	);

	app.post(
		"/session/:id/summarize",
		zValidator("json", SummarizeRequestSchema),
		handler("POST /session/:id/summarize", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.summarize({ path: { id }, body });
		})
	);

	// ========================================
	// Permission APIs
	// ========================================
	app.post(
		"/session/:id/permissions/:permissionId",
		handler("POST /session/:id/permissions/:permissionId", async (client, c) => {
			const id = c.req.param("id");
			const permissionId = c.req.param("permissionId");
			const body = await c.req.json();
			return await client.postSessionIdPermissionsPermissionId({
				path: { id, permissionID: permissionId },
				body
			});
		})
	);

	// ========================================
	// Message APIs
	// ========================================
	app.get(
		"/session/:id/message",
		handler("GET /session/:id/message", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.messages({ path: { id } });
		})
	);

	app.get(
		"/session/:sessionId/message/:messageId",
		handler("GET /session/:sessionId/message/:messageId", async (client, c) => {
			const sessionId = c.req.param("sessionId");
			const messageId = c.req.param("messageId");
			return await client.session.message({ path: { id: sessionId, messageID: messageId } });
		})
	);

	// ========================================
	// Find APIs
	// ========================================
	app.post(
		"/find/text",
		handler("POST /find/text", async (client, c) => {
			const query = await c.req.json();
			return await client.find.text({ query });
		})
	);

	app.post(
		"/find/files",
		handler("POST /find/files", async (client, c) => {
			const query = await c.req.json();
			return await client.find.files({ query });
		})
	);

	app.post(
		"/find/symbols",
		handler("POST /find/symbols", async (client, c) => {
			const query = await c.req.json();
			return await client.find.symbols({ query });
		})
	);

	// ========================================
	// File APIs
	// ========================================
	app.post(
		"/file/read",
		handler("POST /file/read", async (client, c) => {
			const query = await c.req.json();
			return await client.file.read({ query });
		})
	);

	app.post(
		"/file/status",
		handler("POST /file/status", async (client, c) => {
			const query = await c.req.json().catch(() => ({}));
			return await client.file.status({ query });
		})
	);

	// ========================================
	// Auth APIs
	// ========================================
	app.post(
		"/auth/:providerId",
		handler("POST /auth/:providerId", async (client, c) => {
			const providerId = c.req.param("providerId");
			const body = await c.req.json();
			return await client.auth.set({ path: { id: providerId }, body });
		})
	);

	// ========================================
	// Event APIs (SSE)
	// ========================================
	app.get("/event", async () => {
		try {
			console.log('[OpenCode SSE] Client connecting to events endpoint');

			const result = await opencodeClient.event.subscribe();

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
			console.error('[OpenCode SSE] Connection error:', {
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

	// ========================================
	// Health Check
	// ========================================
	app.get("/health", (c) => {
		return c.json({
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	});

	return app;
}
