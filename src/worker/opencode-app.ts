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
	
	/**
	 * Write a log entry to the OpenCode server
	 * @route POST /app/log
	 * @returns {boolean} Success status
	 * @see {@link https://opencode.ai/docs/sdk#app OpenCode SDK - App APIs}
	 */
	app.post(
		"/app/log",
		zValidator("json", LogRequestSchema),
		handler("POST /app/log", async (client, c) => {
			const body = c.req.valid("json");
			return await client.app.log({ body });
		})
	);

	/**
	 * List all available agents configured in OpenCode
	 * @route GET /app/agents
	 * @returns {Agent[]} Array of available agents
	 * @see {@link https://opencode.ai/docs/sdk#app OpenCode SDK - App APIs}
	 */
	app.get(
		"/app/agents",
		handler("GET /app/agents", async (client) => {
			return await client.app.agents();
		})
	);

	// ========================================
	// Project APIs
	// ========================================
	
	/**
	 * List all projects known to the OpenCode server
	 * @route GET /project/list
	 * @returns {Project[]} Array of projects
	 * @see {@link https://opencode.ai/docs/sdk#project OpenCode SDK - Project APIs}
	 */
	app.get(
		"/project/list",
		handler("GET /project/list", async (client) => {
			return await client.project.list();
		})
	);

	/**
	 * Get the current active project
	 * @route GET /project/current
	 * @returns {Project} Current project details
	 * @see {@link https://opencode.ai/docs/sdk#project OpenCode SDK - Project APIs}
	 */
	app.get(
		"/project/current",
		handler("GET /project/current", async (client) => {
			return await client.project.current();
		})
	);

	// ========================================
	// Path APIs
	// ========================================
	
	/**
	 * Get current working directory path information
	 * @route GET /path
	 * @returns {Path} Current path information
	 * @see {@link https://opencode.ai/docs/sdk#path OpenCode SDK - Path APIs}
	 */
	app.get(
		"/path",
		handler("GET /path", async (client) => {
			return await client.path.get();
		})
	);

	// ========================================
	// Config APIs
	// ========================================
	
	/**
	 * Get OpenCode configuration information
	 * @route GET /config
	 * @returns {Config} Server configuration details
	 * @see {@link https://opencode.ai/docs/sdk#config OpenCode SDK - Config APIs}
	 */
	app.get(
		"/config",
		handler("GET /config", async (client) => {
			return await client.config.get();
		})
	);

	/**
	 * List available AI providers and their default models
	 * @route GET /config/providers
	 * @returns {{ providers: Provider[], default: { [key: string]: string } }} Providers and default model mappings
	 * @see {@link https://opencode.ai/docs/sdk#config OpenCode SDK - Config APIs}
	 */
	app.get(
		"/config/providers",
		handler("GET /config/providers", async (client) => {
			return await client.config.providers();
		})
	);

	// ========================================
	// Session APIs
	// ========================================
	
	/**
	 * List all conversation sessions
	 * @route GET /session
	 * @returns {Session[]} Array of sessions
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.get(
		"/session",
		handler("GET /session", async (client) => {
			return await client.session.list();
		})
	);

	/**
	 * Create a new conversation session
	 * @route POST /session
	 * @param {CreateSessionRequest} body - Session creation parameters (e.g., title)
	 * @returns {Session} Newly created session
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session",
		zValidator("json", CreateSessionRequestSchema),
		handler("POST /session", async (client, c) => {
			const body = c.req.valid("json");
			return await client.session.create({ body });
		})
	);

	/**
	 * Get details for a specific session
	 * @route GET /session/:id
	 * @param {string} id - Session ID
	 * @returns {Session} Session details
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.get(
		"/session/:id",
		handler("GET /session/:id", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.get({ path: { id } });
		})
	);

	/**
	 * List child sessions (branched conversations)
	 * @route GET /session/:id/children
	 * @param {string} id - Parent session ID
	 * @returns {Session[]} Array of child sessions
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.get(
		"/session/:id/children",
		handler("GET /session/:id/children", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.children({ path: { id } });
		})
	);

	/**
	 * Update session properties (e.g., title)
	 * @route PATCH /session/:id
	 * @param {string} id - Session ID
	 * @param {UpdateSessionRequest} body - Properties to update
	 * @returns {Session} Updated session
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.patch(
		"/session/:id",
		zValidator("json", UpdateSessionRequestSchema),
		handler("PATCH /session/:id", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.update({ path: { id }, body });
		})
	);

	/**
	 * Delete a session and all its messages
	 * @route DELETE /session/:id
	 * @param {string} id - Session ID
	 * @returns {boolean} Deletion success status
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.delete(
		"/session/:id",
		handler("DELETE /session/:id", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.delete({ path: { id } });
		})
	);

	/**
	 * Initialize a session by analyzing the app and creating AGENTS.md
	 * @route POST /session/:id/init
	 * @param {string} id - Session ID
	 * @param {InitRequest} body - Initialization parameters
	 * @returns {boolean} Initialization success status
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/init",
		zValidator("json", InitRequestSchema),
		handler("POST /session/:id/init", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.init({ path: { id }, body });
		})
	);

	/**
	 * Send a prompt message to the session
	 * Supports both user messages with AI responses and context injection (noReply: true)
	 * @route POST /session/:id/prompt
	 * @param {string} id - Session ID
	 * @param {PromptRequest} body - Message content (text, files) and model selection
	 * @param {boolean} body.noReply - If true, adds context without triggering AI response
	 * @returns {AssistantMessage|UserMessage} AI response or user message (if noReply)
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/prompt",
		zValidator("json", PromptRequestSchema),
		handler("POST /session/:id/prompt", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.prompt({ path: { id }, body });
		})
	);

	/**
	 * Send a command to the session
	 * @route POST /session/:id/command
	 * @param {string} id - Session ID
	 * @param {CommandRequest} body - Command details
	 * @returns {{ info: AssistantMessage, parts: Part[] }} Command response with message parts
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/command",
		zValidator("json", CommandRequestSchema),
		handler("POST /session/:id/command", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.command({ path: { id }, body });
		})
	);

	/**
	 * Run a shell command in the session context
	 * @route POST /session/:id/shell
	 * @param {string} id - Session ID
	 * @param {ShellRequest} body - Shell command to execute
	 * @returns {AssistantMessage} Shell command result
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/shell",
		zValidator("json", ShellRequestSchema),
		handler("POST /session/:id/shell", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.shell({ path: { id }, body });
		})
	);

	/**
	 * Revert a message and all subsequent messages in the session
	 * @route POST /session/:id/revert
	 * @param {string} id - Session ID
	 * @param {RevertRequest} body - Message revert details
	 * @returns {Session} Updated session after revert
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/revert",
		zValidator("json", RevertRequestSchema),
		handler("POST /session/:id/revert", async (client, c) => {
			const id = c.req.param("id");
			const body = c.req.valid("json");
			return await client.session.revert({ path: { id }, body });
		})
	);

	/**
	 * Restore previously reverted messages
	 * @route POST /session/:id/unrevert
	 * @param {string} id - Session ID
	 * @returns {Session} Updated session after restore
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/unrevert",
		handler("POST /session/:id/unrevert", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.unrevert({ path: { id } });
		})
	);

	/**
	 * Abort a running session (stops AI processing)
	 * @route POST /session/:id/abort
	 * @param {string} id - Session ID
	 * @returns {boolean} Abort success status
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/abort",
		handler("POST /session/:id/abort", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.abort({ path: { id } });
		})
	);

	/**
	 * Share a session (make it accessible to others)
	 * @route POST /session/:id/share
	 * @param {string} id - Session ID
	 * @returns {Session} Updated session with sharing enabled
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/share",
		handler("POST /session/:id/share", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.share({ path: { id } });
		})
	);

	/**
	 * Unshare a session (make it private again)
	 * @route POST /session/:id/unshare
	 * @param {string} id - Session ID
	 * @returns {Session} Updated session with sharing disabled
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.post(
		"/session/:id/unshare",
		handler("POST /session/:id/unshare", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.unshare({ path: { id } });
		})
	);

	/**
	 * Generate a summary of the session conversation
	 * @route POST /session/:id/summarize
	 * @param {string} id - Session ID
	 * @param {SummarizeRequest} body - Summarization parameters
	 * @returns {boolean} Summarization success status
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
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
	
	/**
	 * Respond to a permission request from the AI
	 * Used to approve or deny actions that require explicit user consent
	 * @route POST /session/:id/permissions/:permissionId
	 * @param {string} id - Session ID
	 * @param {string} permissionId - Permission request ID
	 * @param {PermissionResponse} body - User's response (approve/deny)
	 * @returns {boolean} Response submission success status
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
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
	
	/**
	 * List all messages in a session
	 * Returns messages with their parts (text, files, tools, reasoning)
	 * @route GET /session/:id/message
	 * @param {string} id - Session ID
	 * @returns {{ info: Message, parts: Part[] }[]} Array of messages with parts
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
	app.get(
		"/session/:id/message",
		handler("GET /session/:id/message", async (client, c) => {
			const id = c.req.param("id");
			return await client.session.messages({ path: { id } });
		})
	);

	/**
	 * Get details for a specific message
	 * @route GET /session/:sessionId/message/:messageId
	 * @param {string} sessionId - Session ID
	 * @param {string} messageId - Message ID
	 * @returns {{ info: Message, parts: Part[] }} Message details with parts
	 * @see {@link https://opencode.ai/docs/sdk#sessions OpenCode SDK - Sessions}
	 */
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
	
	/**
	 * Search for text patterns within files (using ripgrep)
	 * Returns matches with file paths, line numbers, and context
	 * @route POST /find/text
	 * @param {TextSearchRequest} query - Search pattern and options
	 * @returns {Array<{ path: string, lines: string, line_number: number, absolute_offset: number, submatches: any[] }>} Text search results
	 * @see {@link https://opencode.ai/docs/sdk#files OpenCode SDK - Files}
	 */
	app.post(
		"/find/text",
		handler("POST /find/text", async (client, c) => {
			const query = await c.req.json();
			return await client.find.text({ query });
		})
	);

	/**
	 * Find files by name pattern (glob matching)
	 * @route POST /find/files
	 * @param {FileSearchRequest} query - File name pattern to search for
	 * @returns {string[]} Array of matching file paths
	 * @see {@link https://opencode.ai/docs/sdk#files OpenCode SDK - Files}
	 */
	app.post(
		"/find/files",
		handler("POST /find/files", async (client, c) => {
			const query = await c.req.json();
			return await client.find.files({ query });
		})
	);

	/**
	 * Find workspace symbols (functions, classes, variables, etc.)
	 * Uses LSP-style symbol search across the project
	 * @route POST /find/symbols
	 * @param {SymbolSearchRequest} query - Symbol name pattern
	 * @returns {Symbol[]} Array of matching symbols with locations
	 * @see {@link https://opencode.ai/docs/sdk#files OpenCode SDK - Files}
	 */
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
	
	/**
	 * Read file contents from the workspace
	 * Returns file content as raw text or git patch format
	 * @route POST /file/read
	 * @param {FileReadRequest} query - File path to read
	 * @returns {{ type: "raw" | "patch", content: string }} File content and format
	 * @see {@link https://opencode.ai/docs/sdk#files OpenCode SDK - Files}
	 */
	app.post(
		"/file/read",
		handler("POST /file/read", async (client, c) => {
			const query = await c.req.json();
			return await client.file.read({ query });
		})
	);

	/**
	 * Get git status for tracked files in the workspace
	 * Shows modified, added, deleted files and their status
	 * @route POST /file/status
	 * @param {FileStatusRequest?} query - Optional file path filter
	 * @returns {File[]} Array of file status objects
	 * @see {@link https://opencode.ai/docs/sdk#files OpenCode SDK - Files}
	 */
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
	
	/**
	 * Set authentication credentials for an AI provider
	 * Used to configure API keys for providers like Anthropic, OpenAI, etc.
	 * @route POST /auth/:providerId
	 * @param {string} providerId - Provider ID (e.g., "anthropic", "openai")
	 * @param {AuthSetRequest} body - Authentication credentials (type: "api", key: string)
	 * @returns {boolean} Success status
	 * @see {@link https://opencode.ai/docs/sdk#auth OpenCode SDK - Auth}
	 */
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
	
	/**
	 * Subscribe to real-time server-sent events stream
	 * Provides live updates for message processing, tool execution, and session changes
	 * Events include: message.start, message.end, tool.start, tool.end, session.created, etc.
	 * @route GET /event
	 * @returns {ReadableStream} Server-sent events stream
	 * @see {@link https://opencode.ai/docs/sdk#events OpenCode SDK - Events}
	 */
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
	
	/**
	 * Health check endpoint to verify the worker is operational
	 * @route GET /health
	 * @returns {{ status: string, timestamp: string }} Health status and timestamp
	 */
	app.get("/health", (c) => {
		return c.json({
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	});

	return app;
}
