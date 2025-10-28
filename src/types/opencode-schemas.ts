/**
 * Zod schemas for OpenCode API
 * These schemas validate both client requests and API responses
 * All schemas are type-checked against OpenCode SDK types using z.ZodType
 */

import { z } from "zod";
import type {
	Session as OpencodeSession,
	Agent as OpencodeAgent,
	Provider as OpencodeProvider,
	Config as OpencodeConfig,
	Project as OpencodeProject,
	SessionCreateData,
	SessionUpdateData,
	SessionPromptData,
	SessionInitData,
	SessionSummarizeData,
	SessionCommandData,
	SessionShellData,
	SessionRevertData,
	PostSessionIdPermissionsPermissionIdData,
	Auth,
} from "@opencode-ai/sdk/client";

// Base types checked against SDK
export const ModelSchema = z.object({
	providerID: z.string(),
	modelID: z.string(),
});

export const PartSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("text"),
		text: z.string(),
	}),
	z.object({
		type: z.literal("file"),
		mime: z.string(),
		url: z.string(),
		filename: z.string().optional(),
	}),
	z.object({
		type: z.literal("agent"),
		name: z.string(),
	}),
]);

export const MessageInfoSchema = z.object({
	id: z.string(),
	role: z.enum(["user", "assistant"]),
	createdAt: z.string(),
});

export const SessionSchema: z.ZodType<OpencodeSession> = z.object({
	id: z.string(),
	projectID: z.string(),
	directory: z.string(),
	parentID: z.string().optional(),
	summary: z.object({
		diffs: z.array(z.any()),
	}).optional(),
	share: z.object({
		url: z.string(),
	}).optional(),
	title: z.string(),
	version: z.string(),
	time: z.object({
		created: z.number(),
		updated: z.number(),
	}),
});

export const AgentSchema: z.ZodType<OpencodeAgent> = z.object({
	name: z.string(),
	description: z.string().optional(),
	mode: z.enum(["subagent", "primary", "all"]),
	builtIn: z.boolean(),
	topP: z.number().optional(),
	temperature: z.number().optional(),
	permission: z.object({
		edit: z.enum(["ask", "allow", "deny"]),
		bash: z.record(z.enum(["ask", "allow", "deny"])),
		webfetch: z.enum(["ask", "allow", "deny"]).optional(),
	}),
	model: z.object({
		modelID: z.string(),
		providerID: z.string(),
	}).optional(),
	prompt: z.string().optional(),
	tools: z.record(z.boolean()),
	options: z.record(z.unknown()),
});

export const ProviderSchema: z.ZodType<OpencodeProvider> = z.object({
	id: z.string(),
	name: z.string(),
	api: z.string().optional(),
	env: z.array(z.string()),
	npm: z.string().optional(),
	models: z.record(z.any()),
});

export const ConfigSchema: z.ZodType<OpencodeConfig> = z.object({
	$schema: z.string().optional(),
	theme: z.string().optional(),
	keybinds: z.any().optional(),
	command: z.record(z.object({
		template: z.string(),
		description: z.string().optional(),
		agent: z.string().optional(),
		model: z.string().optional(),
		subtask: z.boolean().optional(),
	})).optional(),
	watcher: z.object({
		ignore: z.array(z.string()).optional(),
	}).optional(),
	plugin: z.array(z.string()).optional(),
	snapshot: z.boolean().optional(),
	share: z.enum(["manual", "auto", "disabled"]).optional(),
	autoshare: z.boolean().optional(),
	autoupdate: z.boolean().optional(),
});

export const ProjectSchema: z.ZodType<OpencodeProject> = z.object({
	id: z.string(),
	worktree: z.string(),
	vcs: z.literal("git").optional(),
	time: z.object({
		created: z.number(),
		initialized: z.number().optional(),
	}),
});

export const PathInfoSchema = z.object({
	cwd: z.string(),
	home: z.string().optional(),
});

export const FileStatusSchema = z.object({
	path: z.string(),
	status: z.string(),
	staged: z.boolean().optional(),
});

export const SymbolSchema = z.object({
	name: z.string(),
	kind: z.string(),
	location: z.object({
		path: z.string(),
		range: z.object({
			start: z.object({ line: z.number(), character: z.number() }),
			end: z.object({ line: z.number(), character: z.number() }),
		}),
	}),
});

// Request schemas - type-checked against SDK
export const CreateSessionRequestSchema: z.ZodType<NonNullable<SessionCreateData["body"]>> = z.object({
	title: z.string().optional(),
	parentID: z.string().optional(),
});

export const UpdateSessionRequestSchema: z.ZodType<NonNullable<SessionUpdateData["body"]>> = z.object({
	title: z.string().optional(),
});

export const PromptRequestSchema: z.ZodType<NonNullable<SessionPromptData["body"]>> = z.object({
	messageID: z.string().optional(),
	model: ModelSchema.optional(),
	agent: z.string().optional(),
	noReply: z.boolean().optional(),
	system: z.string().optional(),
	tools: z.record(z.boolean()).optional(),
	parts: z.array(PartSchema),
});

export const CommandRequestSchema: z.ZodType<NonNullable<SessionCommandData["body"]>> = z.object({
	messageID: z.string().optional(),
	agent: z.string().optional(),
	model: z.string().optional(),
	arguments: z.string(),
	command: z.string(),
});

export const ShellRequestSchema: z.ZodType<NonNullable<SessionShellData["body"]>> = z.object({
	agent: z.string(),
	command: z.string(),
});

export const RevertRequestSchema: z.ZodType<NonNullable<SessionRevertData["body"]>> = z.object({
	messageID: z.string(),
	partID: z.string().optional(),
});

export const SummarizeRequestSchema: z.ZodType<NonNullable<SessionSummarizeData["body"]>> = z.object({
	providerID: z.string(),
	modelID: z.string(),
});

export const InitRequestSchema: z.ZodType<NonNullable<SessionInitData["body"]>> = z.object({
	modelID: z.string(),
	providerID: z.string(),
	messageID: z.string(),
});

export const PermissionResponseSchema: z.ZodType<NonNullable<PostSessionIdPermissionsPermissionIdData["body"]>> = z.object({
	response: z.enum(["once", "always", "reject"]),
});

export const LogRequestSchema = z.object({
	service: z.string(),
	level: z.enum(["debug", "info", "warn", "error"]),
	message: z.string(),
	metadata: z.record(z.any()).optional(),
});

export const TextSearchRequestSchema = z.object({
	pattern: z.string(),
	path: z.string().optional(),
	caseSensitive: z.boolean().optional(),
	regex: z.boolean().optional(),
	maxResults: z.number().optional(),
});

export const FileSearchRequestSchema = z.object({
	query: z.string(),
	path: z.string().optional(),
	maxResults: z.number().optional(),
});

export const SymbolSearchRequestSchema = z.object({
	query: z.string(),
	maxResults: z.number().optional(),
});

export const FileReadRequestSchema = z.object({
	path: z.string(),
	type: z.enum(["raw", "patch"]).optional(),
});

export const FileStatusRequestSchema = z.object({
	path: z.string().optional(),
});

export const AuthSetRequestSchema: z.ZodType<Auth> = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("api"),
		key: z.string(),
	}),
	z.object({
		type: z.literal("oauth"),
		refresh: z.string(),
		access: z.string(),
		expires: z.number(),
	}),
	z.object({
		type: z.literal("wellknown"),
		key: z.string(),
		token: z.string(),
	}),
]);

// Response schemas
export const ProvidersResponseSchema = z.object({
	providers: z.array(ProviderSchema),
	default: z.record(z.string()),
});

export const MessageResponseSchema = z.object({
	info: MessageInfoSchema,
	parts: z.array(z.any()), // Parts can have complex structure
});

export const MessagesResponseSchema = z.array(MessageResponseSchema);

export const TextSearchResultSchema = z.object({
	path: z.string(),
	lines: z.string(),
	line_number: z.number(),
	absolute_offset: z.number(),
	submatches: z.array(
		z.object({
			start: z.number(),
			end: z.number(),
		})
	),
});

export const FileReadResponseSchema = z.object({
	type: z.enum(["raw", "patch"]),
	content: z.string(),
});

// Inferred types
export type Model = z.infer<typeof ModelSchema>;
export type Part = z.infer<typeof PartSchema>;
export type MessageInfo = z.infer<typeof MessageInfoSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Provider = z.infer<typeof ProviderSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type PathInfo = z.infer<typeof PathInfoSchema>;
export type FileStatus = z.infer<typeof FileStatusSchema>;
export type Symbol = z.infer<typeof SymbolSchema>;

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;
export type PromptRequest = z.infer<typeof PromptRequestSchema>;
export type CommandRequest = z.infer<typeof CommandRequestSchema>;
export type ShellRequest = z.infer<typeof ShellRequestSchema>;
export type RevertRequest = z.infer<typeof RevertRequestSchema>;
export type SummarizeRequest = z.infer<typeof SummarizeRequestSchema>;
export type InitRequest = z.infer<typeof InitRequestSchema>;
export type PermissionResponse = z.infer<typeof PermissionResponseSchema>;
export type LogRequest = z.infer<typeof LogRequestSchema>;
export type TextSearchRequest = z.infer<typeof TextSearchRequestSchema>;
export type FileSearchRequest = z.infer<typeof FileSearchRequestSchema>;
export type SymbolSearchRequest = z.infer<typeof SymbolSearchRequestSchema>;
export type FileReadRequest = z.infer<typeof FileReadRequestSchema>;
export type FileStatusRequest = z.infer<typeof FileStatusRequestSchema>;
export type AuthSetRequest = z.infer<typeof AuthSetRequestSchema>;

export type ProvidersResponse = z.infer<typeof ProvidersResponseSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;
export type TextSearchResult = z.infer<typeof TextSearchResultSchema>;
export type FileReadResponse = z.infer<typeof FileReadResponseSchema>;
