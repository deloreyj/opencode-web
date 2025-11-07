import { useQuery } from "@tanstack/react-query";
import { getWorkspaceDiff } from "@/lib/workspace-client";
import type { GetWorkspaceDiffResponse } from "@/types/workspace-schemas";

export const workspaceDiffKeys = {
	all: ["workspaceDiff"] as const,
	diff: (workspaceId: string) => [...workspaceDiffKeys.all, workspaceId] as const,
};

/**
 * Hook to fetch git diff for a workspace
 */
export function useWorkspaceDiff(workspaceId: string | null | undefined) {
	return useQuery<GetWorkspaceDiffResponse, Error>({
		queryKey: workspaceDiffKeys.diff(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) {
				throw new Error("Workspace ID is required");
			}
			return await getWorkspaceDiff(workspaceId);
		},
		enabled: !!workspaceId,
		staleTime: 30000, // 30 seconds - diffs can change frequently
		refetchInterval: 60000, // Refetch every 60 seconds
	});
}
