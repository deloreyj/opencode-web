import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
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

interface WorkspaceContextValue {
	workspaces: GetWorkspaceResponse[];
	activeWorkspaceId: string | null;
	setActiveWorkspaceId: (id: string | null) => void;
	createWorkspace: (data: CreateWorkspaceRequest) => Promise<void>;
	deleteWorkspace: (id: string) => Promise<void>;
	refreshWorkspaces: () => Promise<void>;
	isLoading: boolean;
	error: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [workspaces, setWorkspaces] = useState<GetWorkspaceResponse[]>([]);
	const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Invalidate all OpenCode queries when workspace changes
	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
	}, [activeWorkspaceId, queryClient]);

	const refreshWorkspaces = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await apiListWorkspaces();
			setWorkspaces(data);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const createWorkspace = useCallback(
		async (data: CreateWorkspaceRequest) => {
			try {
				setIsLoading(true);
				setError(null);
				const newWorkspace = await apiCreateWorkspace(data);

				// Add to local state
				const workspace: GetWorkspaceResponse = {
					id: newWorkspace.id,
					repoUrl: newWorkspace.repoUrl,
					branch: newWorkspace.branch,
					status: newWorkspace.status,
					createdAt: newWorkspace.createdAt,
					updatedAt: newWorkspace.createdAt,
				};

				setWorkspaces((prev) => [...prev, workspace]);
				setActiveWorkspaceId(workspace.id);

				// Invalidate all OpenCode queries to refresh with new workspace environment
				// This will refetch sessions, messages, providers, agents, config, etc.
				await queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				setError(message);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[queryClient],
	);

	const deleteWorkspace = useCallback(
		async (id: string) => {
			try {
				setIsLoading(true);
				setError(null);
				await apiDeleteWorkspace(id);

				// Remove from local state
				setWorkspaces((prev) => prev.filter((w) => w.id !== id));

				// Clear active workspace if it was deleted
				if (activeWorkspaceId === id) {
					setActiveWorkspaceId(null);
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				setError(message);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[activeWorkspaceId],
	);

	return (
		<WorkspaceContext.Provider
			value={{
				workspaces,
				activeWorkspaceId,
				setActiveWorkspaceId,
				createWorkspace,
				deleteWorkspace,
				refreshWorkspaces,
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
