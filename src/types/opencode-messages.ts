/**
 * Type definitions for OpenCode messages
 * Re-exports and utilities for working with messages from the SDK
 */

import type {
  Message,
  Part,
  AssistantMessage,
  UserMessage,
  TextPart,
  FilePart,
  ToolPart,
  ReasoningPart,
} from "@opencode-ai/sdk/client";

/**
 * Message with parts structure returned by the API
 * Matches the SessionMessagesResponses 200 response type
 */
export interface MessageWithParts {
  info: Message;
  parts: Part[];
}

/**
 * Re-export SDK types for convenience
 */
export type {
  Message,
  Part,
  AssistantMessage,
  UserMessage,
  TextPart,
  FilePart,
  ToolPart,
  ReasoningPart,
};

/**
 * Type guard to check if a message is an assistant message
 */
export function isAssistantMessage(message: Message): message is AssistantMessage {
  return message.role === "assistant";
}

/**
 * Type guard to check if a message is a user message
 */
export function isUserMessage(message: Message): message is UserMessage {
  return message.role === "user";
}

/**
 * Type guard to check if a part is a text part
 */
export function isTextPart(part: Part): part is TextPart {
  return part.type === "text";
}

/**
 * Type guard to check if a part is a file part
 */
export function isFilePart(part: Part): part is FilePart {
  return part.type === "file";
}

/**
 * Type guard to check if a part is a tool part
 */
export function isToolPart(part: Part): part is ToolPart {
  return part.type === "tool";
}

/**
 * Type guard to check if a part is a reasoning part
 */
export function isReasoningPart(part: Part): part is ReasoningPart {
  return part.type === "reasoning";
}
