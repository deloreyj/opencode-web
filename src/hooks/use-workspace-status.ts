import { useQuery } from "@tanstack/react-query";
import { getWorkspaceStatus } from "@/lib/workspace-client";
import type { GetWorkspaceStatusResponse } from "@/types/workspace-schemas";

export const workspaceStatusKeys = {
	all: ["workspaceStatus"] as const,
	status: (workspaceId: string) => [...workspaceStatusKeys.all, workspaceId] as const,
};

export function useWorkspaceStatus(workspaceId: string | null | undefined) {
	return useQuery<GetWorkspaceStatusResponse, Error>({
		queryKey: workspaceStatusKeys.status(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) throw new Error("Workspace ID is required");
			return await getWorkspaceStatus(workspaceId);
		},
		enabled: !!workspaceId,
		staleTime: 10000, // 10 seconds - status changes frequently
		refetchInterval: 30000, // Refetch every 30 seconds
	});
}
