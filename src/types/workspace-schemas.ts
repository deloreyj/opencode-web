import { z } from "zod";

// ========================================
// Workspace Request Schemas
// ========================================

export const CreateWorkspaceRequestSchema = z.object({
	repoUrl: z.string().url("Must be a valid repository URL"),
	branch: z.string().optional().default("main"),
});

export type CreateWorkspaceRequest = z.infer<typeof CreateWorkspaceRequestSchema>;

// ========================================
// Workspace Response Schemas
// ========================================

export const WorkspaceStatusSchema = z.enum([
	"initializing",
	"cloning",
	"ready",
	"error",
	"deleting"
]);

export type WorkspaceStatus = z.infer<typeof WorkspaceStatusSchema>;

export const WorkspaceSchema = z.object({
	id: z.string(),
	repoUrl: z.string().url(),
	branch: z.string(),
	status: WorkspaceStatusSchema,
	opencodeUrl: z.string().url().optional(),
	previewUrls: z.record(z.number(), z.string().url()).optional(),
	error: z.string().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const CreateWorkspaceResponseSchema = z.object({
	id: z.string(),
	status: WorkspaceStatusSchema,
	repoUrl: z.string().url(),
	branch: z.string(),
	createdAt: z.string().datetime(),
});

export type CreateWorkspaceResponse = z.infer<typeof CreateWorkspaceResponseSchema>;

export const ListWorkspacesResponseSchema = z.object({
	workspaces: z.array(WorkspaceSchema),
});

export type ListWorkspacesResponse = z.infer<typeof ListWorkspacesResponseSchema>;

export const GetWorkspaceResponseSchema = WorkspaceSchema;

export type GetWorkspaceResponse = z.infer<typeof GetWorkspaceResponseSchema>;

export const DeleteWorkspaceResponseSchema = z.object({
	success: z.boolean(),
	id: z.string(),
});

export type DeleteWorkspaceResponse = z.infer<typeof DeleteWorkspaceResponseSchema>;

export const GetWorkspaceDiffResponseSchema = z.object({
	diff: z.string(),
	workspaceId: z.string(),
});

export type GetWorkspaceDiffResponse = z.infer<typeof GetWorkspaceDiffResponseSchema>;
