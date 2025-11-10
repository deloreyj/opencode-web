import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import type {
	CreateWorkspaceRequest,
	GetWorkspaceResponse,
} from "@/types/workspace-schemas";
import {
	createWorkspace as apiCreateWorkspace,
	listWorkspaces as apiListWorkspaces,
	deleteWorkspace as apiDeleteWorkspace,
} from "@/lib/workspace-client";
import { opencodeKeys } from "@/hooks/use-opencode";

export const workspaceKeys = {
	all: ["workspaces"] as const,
	lists: () => [...workspaceKeys.all, "list"] as const,
	detail: (id: string) => [...workspaceKeys.all, "detail", id] as const,
};

interface WorkspaceContextValue {
	workspaces: GetWorkspaceResponse[];
	activeWorkspaceId: string | null;
	setActiveWorkspaceId: (id: string | null) => void;
	createWorkspace: (data: CreateWorkspaceRequest) => Promise<void>;
	deleteWorkspace: (id: string) => Promise<void>;
	isLoading: boolean;
	isCreatingWorkspace: boolean;
	error: Error | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
		null,
	);

	// Auto-create default workspace mutation (triggered automatically if no workspaces exist)
	const autoCreateWorkspaceMutation = useMutation({
		mutationFn: apiCreateWorkspace,
		onSuccess: (newWorkspace) => {
			// Invalidate workspace list to include the new workspace
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			// Auto-select the new workspace
			setActiveWorkspaceId(newWorkspace.id);
			// Invalidate OpenCode queries
			queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
		},
	});

	// Use React Query to fetch workspaces
	const {
		data: workspaces = [],
		isLoading,
		error,
	} = useQuery<GetWorkspaceResponse[], Error>({
		queryKey: workspaceKeys.lists(),
		queryFn: apiListWorkspaces,
		staleTime: 60000, // 1 minute
		select: (data) => {
			// Auto-select workspace or auto-create if none exist
			if (!activeWorkspaceId && !autoCreateWorkspaceMutation.isPending) {
				if (data.length > 0) {
					const hasLocal = data.some((ws) => ws.id === "local");
					const firstSandbox = data.find((ws) => ws.id !== "local");
					
					// Prefer local in dev, first sandbox in production
					const workspaceToSelect = hasLocal ? "local" : firstSandbox?.id;
					if (workspaceToSelect) {
						// Use queueMicrotask to avoid setState during render
						queueMicrotask(() => setActiveWorkspaceId(workspaceToSelect));
					}
				} else if (!autoCreateWorkspaceMutation.isSuccess) {
					// No workspaces exist - auto-create one (only in production)
					console.log("[WorkspaceContext] No workspaces found, creating default sandbox...");
					queueMicrotask(() => {
						autoCreateWorkspaceMutation.mutate({
							repoUrl: "https://github.com/deloreyj/worker-app-boilerplate",
							branch: "main",
						});
					});
				}
			}
			return data;
		},
	});

	// Use mutations for create and delete
	const createWorkspaceMutation = useMutation({
		mutationFn: apiCreateWorkspace,
		onSuccess: (newWorkspace) => {
			// Invalidate and refetch workspaces
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			// Set the new workspace as active
			setActiveWorkspaceId(newWorkspace.id);
			// Invalidate OpenCode queries for the new workspace
			queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
		},
	});

	const deleteWorkspaceMutation = useMutation({
		mutationFn: apiDeleteWorkspace,
		onSuccess: (_, deletedId) => {
			// Invalidate and refetch workspaces
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			// Clear active workspace if it was deleted
			if (activeWorkspaceId === deletedId) {
				setActiveWorkspaceId(null);
			}
		},
	});

	const createWorkspace = useCallback(
		async (data: CreateWorkspaceRequest) => {
			await createWorkspaceMutation.mutateAsync(data);
		},
		[createWorkspaceMutation],
	);

	const deleteWorkspace = useCallback(
		async (id: string) => {
			await deleteWorkspaceMutation.mutateAsync(id);
		},
		[deleteWorkspaceMutation],
	);

	// Handle workspace changes - invalidate OpenCode queries
	const handleSetActiveWorkspaceId = useCallback((id: string | null) => {
		setActiveWorkspaceId(id);
		queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
	}, [queryClient]);

	return (
		<WorkspaceContext.Provider
			value={{
				workspaces,
				activeWorkspaceId,
				setActiveWorkspaceId: handleSetActiveWorkspaceId,
				createWorkspace,
				deleteWorkspace,
				isLoading,
				isCreatingWorkspace: autoCreateWorkspaceMutation.isPending || createWorkspaceMutation.isPending,
				error,
			}}
		>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	const context = useContext(WorkspaceContext);
	if (!context) {
		throw new Error("useWorkspace must be used within WorkspaceProvider");
	}
	return context;
}
