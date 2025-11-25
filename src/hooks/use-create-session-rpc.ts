/**
 * RPC-based hook for creating sessions
 * Uses Cap'n Web instead of React Query
 */

import { useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { createRpcSession } from "@/lib/opencode-rpc-client";
import type { Session } from "@/types/opencode-schemas";

interface UseCreateSessionRpcResult {
  mutate: (title: string) => Promise<Session>;
  isPending: boolean;
  error: Error | null;
}

/**
 * Hook to create a new session using Cap'n Web RPC
 * 
 * This replaces the React Query version (useCreateSession)
 * 
 * Benefits over React Query:
 * - Can batch create + refetch in a SINGLE HTTP request
 * - No need for queryClient.invalidateQueries
 * - Returns the new session and updated list together
 * 
 * Compatible with React Query:
 * - Accepts onSuccess callback to update React Query cache
 * - Has same API shape (mutate, mutateAsync, isPending)
 */
export function useCreateSessionRpc(
  onSuccess?: (session: Session, allSessions: Session[]) => void
): UseCreateSessionRpcResult & { mutateAsync: (title: string) => Promise<Session> } {
  const { activeWorkspaceId } = useWorkspace();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mutate = async (title: string): Promise<Session> => {
    if (!activeWorkspaceId) {
      throw new Error("No workspace selected");
    }
    
    setIsPending(true);
    setError(null);
    
    try {
      console.log("[useCreateSessionRpc] Creating session via RPC...");
      
      // 🪄 THE MAGIC: Create session AND fetch updated list in ONE HTTP request!
      using api = createRpcSession(activeWorkspaceId);
      
      // Queue up both calls (don't await yet!)
      const newSessionPromise = api.createSession(title);
      const allSessionsPromise = api.listSessions();
      
      // NOW await both - single HTTP request containing 2 RPC calls!
      const [newSession, allSessions] = await Promise.all([
        newSessionPromise,
        allSessionsPromise,
      ]);
      
      console.log("[useCreateSessionRpc] Created session:", newSession.id);
      
      // Call success callback with both the new session and updated list
      if (onSuccess) {
        onSuccess(newSession, allSessions);
      }
      
      return newSession;
    } catch (err) {
      console.error("[useCreateSessionRpc] Failed:", err);
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };
  
  return {
    mutate,
    mutateAsync: mutate, // Alias for React Query compatibility
    isPending,
    error,
  };
}
