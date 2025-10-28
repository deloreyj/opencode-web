/**
 * Hook for updating messages list in real-time from SSE events
 * Matches Go TUI behavior: updates messages in-place as events arrive
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOpencodeEvents } from "./use-opencode-events";
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

export interface UseStreamingUpdatesOptions {
  /**
   * Session ID to filter events for
   */
  sessionId: string | undefined;

  /**
   * Callback when streaming completes
   */
  onStreamComplete?: () => void;
}

/**
 * Hook to update messages list in real-time as SSE events arrive
 * Updates the React Query cache directly, following Go TUI pattern
 */
export function useStreamingUpdates(options: UseStreamingUpdatesOptions) {
  const { sessionId, onStreamComplete } = options;
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    (event: OpencodeEvent) => {
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
    [sessionId, queryClient, onStreamComplete]
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
