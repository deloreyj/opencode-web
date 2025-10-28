/**
 * Hook for managing OpenCode Server-Sent Events connection
 * Provides real-time updates for messages, tools, and session changes
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { OpencodeEvent } from "@/types/opencode-events";
import { isEventForSession } from "./opencode-event-utils";

export interface OpencodeEventsState {
  connected: boolean;
  error: Error | null;
  lastEvent: OpencodeEvent | null;
  failedAttempts: number;
  hasExceededRetries: boolean;
}

export interface UseOpencodeEventsOptions {
  /**
   * Filter events to only this session ID
   */
  sessionId?: string;

  /**
   * Callback when any event is received
   */
  onEvent?: (event: OpencodeEvent) => void;

  /**
   * Callback when connection opens
   */
  onConnect?: () => void;

  /**
   * Callback when connection closes
   */
  onDisconnect?: () => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Enable/disable the connection
   */
  enabled?: boolean;

  /**
   * Automatically reconnect on disconnect
   */
  autoReconnect?: boolean;

  /**
   * Reconnect delay in milliseconds
   */
  reconnectDelay?: number;

  /**
   * Maximum number of retry attempts before giving up
   */
  maxRetries?: number;
}

/**
 * Hook to manage SSE connection to OpenCode events
 */
export function useOpencodeEvents(options: UseOpencodeEventsOptions = {}) {
  const {
    sessionId,
    onEvent,
    onConnect,
    onDisconnect,
    onError,
    enabled = true,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxRetries = 3,
  } = options;

  const [state, setState] = useState<OpencodeEventsState>({
    connected: false,
    error: null,
    lastEvent: null,
    failedAttempts: 0,
    hasExceededRetries: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldConnectRef = useRef(enabled);
  const failedAttemptsRef = useRef(0);

  // Update ref when enabled changes
  useEffect(() => {
    shouldConnectRef.current = enabled;
  }, [enabled]);

  const connect = useCallback(() => {
    if (!shouldConnectRef.current) return;
    if (eventSourceRef.current) return; // Already connected

    // Check if max retries exceeded
    if (failedAttemptsRef.current >= maxRetries) {
      console.warn(`[OpenCode SSE] Max retries (${maxRetries}) exceeded, giving up`);
      setState((prev) => ({
        ...prev,
        hasExceededRetries: true,
        failedAttempts: failedAttemptsRef.current,
      }));
      return;
    }

    try {
      console.log("[OpenCode SSE] Connecting...", {
        attempt: failedAttemptsRef.current + 1,
        maxRetries,
      });
      const eventSource = new EventSource("/api/opencode/event");

      eventSource.onopen = () => {
        console.log("[OpenCode SSE] Connected");
        setState((prev) => ({
          ...prev,
          connected: true,
          error: null,
        }));
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as OpencodeEvent;

          // Reset failed attempts on first successful message
          if (failedAttemptsRef.current > 0) {
            console.log("[OpenCode SSE] Received first message, resetting retry counter");
            failedAttemptsRef.current = 0;
            setState((prev) => ({
              ...prev,
              failedAttempts: 0,
              hasExceededRetries: false,
            }));
          }

          // Filter by session ID if specified
          if (!isEventForSession(data, sessionId)) {
            return;
          }

          console.log("[OpenCode SSE] Event:", data.type, data);

          setState((prev) => ({ ...prev, lastEvent: data }));
          onEvent?.(data);
        } catch (err) {
          console.error("[OpenCode SSE] Failed to parse event:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("[OpenCode SSE] Error:", err);
        const error = new Error("SSE connection error");

        // Increment failed attempts
        failedAttemptsRef.current += 1;

        setState((prev) => ({
          ...prev,
          connected: false,
          error,
          failedAttempts: failedAttemptsRef.current,
        }));

        onError?.(error);
        onDisconnect?.();

        // Cleanup
        eventSource.close();
        eventSourceRef.current = null;

        // Auto-reconnect only if we haven't exceeded max retries
        if (autoReconnect && shouldConnectRef.current && failedAttemptsRef.current < maxRetries) {
          console.log(`[OpenCode SSE] Reconnecting in ${reconnectDelay}ms... (attempt ${failedAttemptsRef.current + 1}/${maxRetries})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else if (failedAttemptsRef.current >= maxRetries) {
          console.warn(`[OpenCode SSE] Max retries (${maxRetries}) exceeded, giving up`);
          setState((prev) => ({
            ...prev,
            hasExceededRetries: true,
          }));
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error("[OpenCode SSE] Failed to connect:", err);
      const error = err instanceof Error ? err : new Error("Failed to connect");
      failedAttemptsRef.current += 1;

      setState((prev) => ({
        ...prev,
        connected: false,
        error,
        failedAttempts: failedAttemptsRef.current,
        hasExceededRetries: failedAttemptsRef.current >= maxRetries,
      }));
      onError?.(error);
    }
  }, [sessionId, onEvent, onConnect, onDisconnect, onError, autoReconnect, reconnectDelay, maxRetries]);

  const disconnect = useCallback(() => {
    console.log("[OpenCode SSE] Disconnecting...");
    shouldConnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setState((prev) => ({ ...prev, connected: false }));
      onDisconnect?.();
    }
  }, [onDisconnect]);

  // Connect/disconnect based on enabled flag
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
