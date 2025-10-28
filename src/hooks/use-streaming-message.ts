/**
 * Hook for managing streaming message state
 * Uses the full text from message parts (not deltas) for simplicity
 */

import { useState, useCallback, useEffect } from "react";
import { useOpencodeEvents } from "./use-opencode-events";
import {
  getMessageInfo,
  getPartInfo,
  isAssistantMessage,
} from "./opencode-event-utils";
import type { OpencodeEvent } from "@/types/opencode-events";

export interface StreamingMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  isStreaming: boolean;
}

export interface UseStreamingMessageOptions {
  /**
   * Callback when streaming completes
   */
  onStreamComplete?: () => void;
}

/**
 * Hook to manage streaming message state for a session
 * Simplified approach: use full text from parts, not deltas
 */
export function useStreamingMessage(
  sessionId: string | undefined,
  options: UseStreamingMessageOptions = {}
) {
  const { onStreamComplete } = options;
  const [streamingMessage, setStreamingMessage] =
    useState<StreamingMessage | null>(null);

  const handleEvent = useCallback(
    (event: OpencodeEvent) => {
      switch (event.type) {
        case "message.updated": {
          const message = getMessageInfo(event);
          if (!message) return;

          // Only track assistant messages for streaming
          if (isAssistantMessage(message.role)) {
            setStreamingMessage((prev) => {
              // If we already have this message, keep it
              if (prev?.id === message.id) return prev;

              // New assistant message - initialize for streaming
              return {
                id: message.id,
                role: "assistant",
                text: "",
                isStreaming: true,
              };
            });
          }
          break;
        }

        case "message.part.updated": {
          const part = getPartInfo(event);
          if (!part) return;

          // Only handle text parts
          if (part.type === "text" && part.text) {
            setStreamingMessage((prev) => {
              // Only update if this part belongs to the current streaming message
              if (!prev || prev.id !== part.messageID) return prev;

              // Use the full text from the part (not delta)
              return {
                ...prev,
                text: part.text,
              };
            });
          }
          break;
        }

        case "session.idle": {
          // Streaming complete
          setStreamingMessage((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              isStreaming: false,
            };
          });
          onStreamComplete?.();
          break;
        }

        case "session.error": {
          // Stop streaming on error
          setStreamingMessage((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              isStreaming: false,
            };
          });
          break;
        }

        case "message.removed": {
          const messageId = (event as any).properties?.messageID;
          setStreamingMessage((prev) => {
            if (prev?.id === messageId) return null;
            return prev;
          });
          break;
        }
      }
    },
    [onStreamComplete]
  );

  const { connected, error, hasExceededRetries } = useOpencodeEvents({
    sessionId,
    onEvent: handleEvent,
    enabled: !!sessionId,
  });

  // Clear streaming message when session changes
  useEffect(() => {
    setStreamingMessage(null);
  }, [sessionId]);

  return {
    streamingMessage,
    connected,
    error,
    hasExceededRetries,
  };
}
