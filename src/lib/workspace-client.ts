import type {
	CreateWorkspaceRequest,
	CreateWorkspaceResponse,
	GetWorkspaceResponse,
	ListWorkspacesResponse,
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
