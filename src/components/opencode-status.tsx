/**
 * OpenCode Status Component
 * Displays connection status, server info, and session usage (cost/tokens)
 */

import { useOpencodeConfig, type SessionUsage } from "@/hooks/use-opencode";
import { useWorkspace } from "@/lib/workspace-context";
import { XCircle, Loader2, WifiOff } from "lucide-react";

interface OpencodeStatusProps {
  sseConnected?: boolean;
  hasExceededRetries?: boolean;
  sessionUsage?: SessionUsage | null;
}

/**
 * Format cost in dollars
 */
function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count with K/M suffixes
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function OpencodeStatus({ sseConnected, hasExceededRetries, sessionUsage }: OpencodeStatusProps = {}) {
  const { data: serverInfo, isLoading, error } = useOpencodeConfig();
  const { isCreatingWorkspace, activeWorkspaceId } = useWorkspace();

  // Show workspace creation status
  if (isCreatingWorkspace) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Creating workspace...</span>
      </div>
    );
  }

  // Show loading only if we have a workspace selected but config is loading
  if (isLoading && activeWorkspaceId) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Connecting to OpenCode...</span>
      </div>
    );
  }

  // Show error only if we have a workspace selected but can't connect
  if ((error || !serverInfo) && activeWorkspaceId) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="size-4" />
        <span>OpenCode server not available</span>
      </div>
    );
  }

  // No workspace selected - show nothing or a neutral state
  if (!activeWorkspaceId) {
    return null;
  }

  const totalTokens = sessionUsage ? 
    sessionUsage.totalTokens.input + 
    sessionUsage.totalTokens.output + 
    sessionUsage.totalTokens.reasoning : 0;

  return (
    <div className="flex items-center text-sm justify-between">
      {sseConnected && !hasExceededRetries && (
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <div className="size-2 rounded-full bg-current animate-pulse" />
          <span className="text-xs">streaming</span>
        </div>
      )}

      {hasExceededRetries && (
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <WifiOff className="size-3.5" />
          <span className="text-xs">http</span>
        </div>
      )}

      {sessionUsage && totalTokens > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span title={`Total tokens: ${totalTokens.toLocaleString()}`}>
            {formatTokens(totalTokens)} tokens
          </span>
          <span title={`Total cost: ${formatCost(sessionUsage.totalCost)}`}>
            {formatCost(sessionUsage.totalCost)}
          </span>
        </div>
      )}
    </div>
  );
}
