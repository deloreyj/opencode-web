import { useWorkspace } from "@/lib/workspace-context";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function WorkspaceSelector() {
	const {
		workspaces,
		activeWorkspaceId,
		setActiveWorkspaceId,
		deleteWorkspace,
		isLoading,
	} = useWorkspace();

	const handleDelete = async (
		e: React.MouseEvent,
		workspaceId: string,
	) => {
		e.stopPropagation();
		if (
			confirm(
				"Are you sure you want to delete this workspace? This will terminate the sandbox container.",
			)
		) {
			try {
				await deleteWorkspace(workspaceId);
			} catch (err) {
				console.error("Failed to delete workspace:", err);
			}
		}
	};

	if (workspaces.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No workspaces. Create one to get started.
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Select
				value={activeWorkspaceId || ""}
				onValueChange={setActiveWorkspaceId}
				disabled={isLoading}
			>
				<SelectTrigger className="w-[300px]">
					<SelectValue placeholder="Select workspace" />
				</SelectTrigger>
				<SelectContent>
					{workspaces.map((workspace) => (
						<SelectItem key={workspace.id} value={workspace.id}>
							<div className="flex items-center justify-between w-full">
								<span className="truncate">
									{workspace.id === "local"
										? "Local Development"
										: `${workspace.repoUrl.split("/").slice(-2).join("/")} (${workspace.branch})`}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{activeWorkspaceId && activeWorkspaceId !== "local" && (
				<Button
					variant="ghost"
					size="icon"
					onClick={(e) => handleDelete(e, activeWorkspaceId)}
					disabled={isLoading}
					title="Delete workspace"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
