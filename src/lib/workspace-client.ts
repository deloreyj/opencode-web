import type {
	CreateWorkspaceRequest,
	CreateWorkspaceResponse,
	GetWorkspaceResponse,
	GetWorkspaceDiffResponse,
	GetWorkspaceStatusResponse,
	ListWorkspacesResponse,
	StageAllResponse,
	StageFileResponse,
	UnstageFileResponse,
} from "@/types/workspace-schemas";

const API_BASE = "/api/workspaces";

export async function createWorkspace(
	data: CreateWorkspaceRequest,
): Promise<CreateWorkspaceResponse> {
	const response = await fetch(API_BASE, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Failed to create workspace");
	}

	const result = await response.json();
	return result.data;
}

export async function listWorkspaces(): Promise<GetWorkspaceResponse[]> {
	const response = await fetch(API_BASE);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Failed to list workspaces");
	}

	const result: ListWorkspacesResponse = await response.json();
	return result.workspaces;
}

export async function getWorkspace(
	id: string,
): Promise<GetWorkspaceResponse> {
	const response = await fetch(`${API_BASE}/${id}`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Failed to get workspace");
	}

	const result = await response.json();
	return result.data;
}

export async function deleteWorkspace(id: string): Promise<void> {
	const response = await fetch(`${API_BASE}/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Failed to delete workspace");
	}
}

export async function getWorkspaceDiff(
	id: string,
): Promise<GetWorkspaceDiffResponse> {
	const response = await fetch(`${API_BASE}/${id}/diff`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Failed to get workspace diff");
	}

	const result = await response.json();
	return result.data;
}

export async function stageAllChanges(
	id: string,
): Promise<StageAllResponse> {
	const response = await fetch(`${API_BASE}/${id}/stage-all`, {
		method: "POST",
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || error.error || "Failed to stage changes");
	}

	const result = await response.json();
	return result.data;
}

export async function getWorkspaceStatus(
	id: string,
): Promise<GetWorkspaceStatusResponse> {
	const response = await fetch(`${API_BASE}/${id}/status`);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Failed to get workspace status");
	}

	const result = await response.json();
	return result.data;
}

export async function stageFile(
	id: string,
	filepath: string,
): Promise<StageFileResponse> {
	const response = await fetch(`${API_BASE}/${id}/stage`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ filepath }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || error.error || "Failed to stage file");
	}

	const result = await response.json();
	return result.data;
}

export async function unstageFile(
	id: string,
	filepath: string,
): Promise<UnstageFileResponse> {
	const response = await fetch(`${API_BASE}/${id}/unstage`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ filepath }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || error.error || "Failed to unstage file");
	}

	const result = await response.json();
	return result.data;
}
