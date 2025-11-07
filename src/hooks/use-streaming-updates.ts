/**
 * Hook for updating messages list in real-time from SSE events
 * Matches Go TUI behavior: updates messages in-place as events arrive
 */

import { useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOpencodeEvents } from "./use-opencode-events";
import { useWorkspace } from "@/lib/workspace-context";
import {
  getMessageInfo,
  getPartInfo,
  isMessageRemovedEvent,
  isSessionIdleEvent,
  isSessionErrorEvent,
} from "./opencode-event-utils";
import {
  upsertMessage,
  upsertMessagePart,
  removeMessage,
} from "@/lib/message-cache-utils";
import type { OpencodeEvent } from "@/types/opencode-events";
import type { MessageWithParts } from "@/types/opencode-messages";
import { opencodeKeys } from "./use-opencode";
import { useOpencodeClient } from "./use-opencode-client";

export interface UseStreamingUpdatesOptions {
  /**
   * Session ID to filter events for
   */
  sessionId: string | undefined;

  /**
   * Callback when streaming completes
   */
  onStreamComplete?: () => void;

  /**
   * Callback when a new session is auto-created
   */
  onSessionCreated?: (sessionId: string) => void;
}

/**
 * Hook to update messages list in real-time as SSE events arrive
 * Updates the React Query cache directly, following Go TUI pattern
 */
export function useStreamingUpdates(options: UseStreamingUpdatesOptions) {
  const { sessionId, onStreamComplete, onSessionCreated } = options;
  const queryClient = useQueryClient();
  const opencodeClient = useOpencodeClient();
  const { activeWorkspaceId } = useWorkspace();
  
  // Track if we've already handled server.connected to prevent duplicates
  const hasHandledServerConnected = useRef(false);
  
  // Reset the flag when workspace changes so we can create a session for the new workspace
  useEffect(() => {
    hasHandledServerConnected.current = false;
  }, [activeWorkspaceId]);

  const handleEvent = useCallback(
    async (event: OpencodeEvent) => {
      // Handle server.connected event - server is ready, create default session and refresh queries
      if (event.type === "server.connected") {
        // Only handle once per connection
        if (hasHandledServerConnected.current) {
          console.log("[Streaming] Server connected event already handled, skipping");
          return;
        }
        hasHandledServerConnected.current = true;
        
        console.log("[Streaming] Server connected, creating default session and refreshing queries");
        
        // Proactively create a default session for new workspaces
        try {
          const { data: newSession, error } = await opencodeClient.session.create({
            body: { title: "New Conversation" },
          });
          
          if (newSession && !error) {
            console.log("[Streaming] Created default session:", newSession.id);
            // Notify parent component to set as active
            onSessionCreated?.(newSession.id);
          } else {
            console.error("[Streaming] Failed to create default session:", error);
          }
        } catch (err) {
          console.error("[Streaming] Error creating default session:", err);
        }
        
        // Refresh all queries to get latest data from the server
        queryClient.invalidateQueries({ queryKey: opencodeKeys.all });
        return;
      }

      if (!sessionId) return;

      // Handle message.updated event
      const messageInfo = getMessageInfo(event);
      if (messageInfo) {
        queryClient.setQueryData<MessageWithParts[]>(
          opencodeKeys.messages(sessionId),
          (oldMessages = []) => upsertMessage(oldMessages, messageInfo)
        );
        return;
      }

      // Handle message.part.updated event
      const partInfo = getPartInfo(event);
      if (partInfo) {
        queryClient.setQueryData<MessageWithParts[]>(
          opencodeKeys.messages(sessionId),
          (oldMessages = []) => upsertMessagePart(oldMessages, partInfo)
        );
        return;
      }

      // Handle message.removed event
      if (isMessageRemovedEvent(event)) {
        const messageId = event.properties.messageID;
        if (messageId) {
          queryClient.setQueryData<MessageWithParts[]>(
            opencodeKeys.messages(sessionId),
            (oldMessages = []) => removeMessage(oldMessages, messageId)
          );
        }
        return;
      }

      // Handle session.idle event
      if (isSessionIdleEvent(event)) {
        console.log("[Streaming] Session idle, streaming complete");
        onStreamComplete?.();
        return;
      }

      // Handle session.error event
      if (isSessionErrorEvent(event)) {
        console.error("[Streaming] Session error", event.properties);
        return;
      }
    },
    [sessionId, queryClient, onStreamComplete, onSessionCreated, opencodeClient]
  );

  const { connected, error, hasExceededRetries } = useOpencodeEvents({
    sessionId,
    onEvent: handleEvent,
    enabled: !!sessionId,
  });

  return {
    connected,
    error,
    hasExceededRetries,
  };
}
