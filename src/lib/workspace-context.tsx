import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
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
	error: Error | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
		null,
	);

	// Use React Query to fetch workspaces
	const {
		data: workspaces = [],
		isLoading,
		error,
	} = useQuery<GetWorkspaceResponse[], Error>({
		queryKey: workspaceKeys.lists(),
		queryFn: apiListWorkspaces,
		staleTime: 60000, // 1 minute
	});

	// Auto-select "local" workspace if no workspace is selected
	useEffect(() => {
		if (!activeWorkspaceId && workspaces.some((ws) => ws.id === "local")) {
			setActiveWorkspaceId("local");
		}
	}, [activeWorkspaceId, workspaces]);

	// Invalidate all OpenCode queries when workspace changes
	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
	}, [activeWorkspaceId, queryClient]);

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

	return (
		<WorkspaceContext.Provider
			value={{
				workspaces,
				activeWorkspaceId,
				setActiveWorkspaceId,
				createWorkspace,
				deleteWorkspace,
				isLoading,
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
