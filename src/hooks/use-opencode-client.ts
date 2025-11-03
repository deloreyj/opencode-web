import { useMemo } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { createOpencodeClient } from "@/lib/opencode-client";

/**
 * Hook to get an OpenCode client configured for the active workspace
 * Uses direct mode (local) if no workspace is selected
 */
export function useOpencodeClient() {
	const { activeWorkspaceId } = useWorkspace();

	return useMemo(
		() => createOpencodeClient(activeWorkspaceId),
		[activeWorkspaceId],
	);
}
