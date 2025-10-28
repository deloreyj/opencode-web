/**
 * Utility functions for parsing OpenCode events
 * Extracted for testability and clarity
 */

import type {
  OpencodeEvent,
  EventMessageUpdated,
  EventMessagePartUpdated,
  EventMessageRemoved,
  EventSessionIdle,
  EventSessionError,
} from "@/types/opencode-events";
import type { EventSessionUpdated, Message, Part } from "@opencode-ai/sdk/client";

/**
 * Type guard for message.updated event
 */
export function isMessageUpdatedEvent(
  event: OpencodeEvent
): event is EventMessageUpdated {
  return event.type === "message.updated";
}

/**
 * Type guard for message.part.updated event
 */
export function isMessagePartUpdatedEvent(
  event: OpencodeEvent
): event is EventMessagePartUpdated {
  return event.type === "message.part.updated";
}

/**
 * Type guard for message.removed event
 */
export function isMessageRemovedEvent(
  event: OpencodeEvent
): event is EventMessageRemoved {
  return event.type === "message.removed";
}

/**
 * Type guard for session.idle event
 */
export function isSessionIdleEvent(
  event: OpencodeEvent
): event is EventSessionIdle {
  return event.type === "session.idle";
}

/**
 * Type guard for session.error event
 */
export function isSessionErrorEvent(
  event: OpencodeEvent
): event is EventSessionError {
  return event.type === "session.error";
}

/**
 * Type guard for session.updated event
 */
export function isSessionUpdatedEvent(
  event: OpencodeEvent
): event is EventSessionUpdated {
  return event.type === "session.updated";
}

/**
 * Extract sessionID from an event
 * Events may have sessionID in different locations depending on type
 */
export function getEventSessionId(event: OpencodeEvent): string | undefined {
  if (isMessageUpdatedEvent(event)) {
    return event.properties.info.sessionID;
  }
  if (isMessagePartUpdatedEvent(event)) {
    return event.properties.part.sessionID;
  }
  if (isSessionUpdatedEvent(event)) {
    return event.properties.info.id;
  }
  // For other events, check if they have sessionID in properties
  if ("sessionID" in event.properties) {
    return (event.properties as { sessionID?: string }).sessionID;
  }
  return undefined;
}

/**
 * Check if an event belongs to a specific session
 */
export function isEventForSession(
  event: OpencodeEvent,
  sessionId: string | undefined
): boolean {
  if (!sessionId) return true; // No filter applied
  const eventSessionId = getEventSessionId(event);
  return !eventSessionId || eventSessionId === sessionId;
}

/**
 * Extract message info from message.updated event
 */
export function getMessageInfo(event: OpencodeEvent): Message | null {
  if (!isMessageUpdatedEvent(event)) return null;
  return event.properties.info;
}

/**
 * Extract part info from message.part.updated event
 * Returns part with messageID for convenience
 */
export function getPartInfo(
  event: OpencodeEvent
): (Part & { messageID: string }) | null {
  if (!isMessagePartUpdatedEvent(event)) return null;
  return event.properties.part;
}
