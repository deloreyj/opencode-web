/**
 * OpenCode Status Component
 * Displays connection status and server info
 */

import { useOpencodeConfig } from "@/hooks/use-opencode";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function OpencodeStatus() {
  const { data: serverInfo, isLoading, error } = useOpencodeConfig();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Connecting to OpenCode...</span>
      </div>
    );
  }

  if (error || !serverInfo) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="size-4" />
        <span>OpenCode server not available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
      <CheckCircle2 className="size-4" />
      <span>OpenCode connected</span>
      {serverInfo.model && (
        <span className="text-muted-foreground text-xs">
          {serverInfo.model}
        </span>
      )}
    </div>
  );
}
