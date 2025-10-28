/**
 * Pure utility functions for updating message cache
 * These functions are immutable, testable, and composable
 */

import type { MessageWithParts } from "@/types/opencode-messages";
import type { Message, Part } from "@opencode-ai/sdk/client";

/**
 * Add or update a message in the messages array
 * If message exists (by id), updates it. Otherwise appends it.
 *
 * @param messages - Current messages array
 * @param messageInfo - Message info to upsert
 * @returns New messages array with message added/updated
 */
export function upsertMessage(
  messages: MessageWithParts[],
  messageInfo: Message
): MessageWithParts[] {
  const existingIndex = messages.findIndex((m) => m.info.id === messageInfo.id);

  if (existingIndex > -1) {
    // Update existing message
    return messages.map((m, i) =>
      i === existingIndex ? { ...m, info: messageInfo } : m
    );
  }

  // Add new message with empty parts array
  return [...messages, { info: messageInfo, parts: [] }];
}

/**
 * Add or update a part in a message
 * If part exists (by id), updates it. Otherwise appends it.
 *
 * @param messages - Current messages array
 * @param part - Part to upsert
 * @returns New messages array with part added/updated
 */
export function upsertMessagePart(
  messages: MessageWithParts[],
  part: Part & { messageID: string }
): MessageWithParts[] {
  const messageIndex = messages.findIndex((m) => m.info.id === part.messageID);

  if (messageIndex === -1) {
    // Message not found, return unchanged
    return messages;
  }

  const message = messages[messageIndex];
  const partIndex = message.parts.findIndex((p) => p.id === part.id);

  // Update or append part
  const updatedParts =
    partIndex > -1
      ? message.parts.map((p, i) => (i === partIndex ? part : p))
      : [...message.parts, part];

  // Return new array with updated message
  return messages.map((m, i) =>
    i === messageIndex ? { ...m, parts: updatedParts } : m
  );
}

/**
 * Remove a message from the messages array
 *
 * @param messages - Current messages array
 * @param messageId - ID of message to remove
 * @returns New messages array without the message
 */
export function removeMessage(
  messages: MessageWithParts[],
  messageId: string
): MessageWithParts[] {
  return messages.filter((m) => m.info.id !== messageId);
}

/**
 * Remove a part from a message
 *
 * @param messages - Current messages array
 * @param partId - ID of part to remove
 * @param messageId - ID of message containing the part
 * @returns New messages array with part removed
 */
export function removeMessagePart(
  messages: MessageWithParts[],
  partId: string,
  messageId: string
): MessageWithParts[] {
  const messageIndex = messages.findIndex((m) => m.info.id === messageId);

  if (messageIndex === -1) {
    return messages;
  }

  const message = messages[messageIndex];
  const updatedParts = message.parts.filter((p) => p.id !== partId);

  return messages.map((m, i) =>
    i === messageIndex ? { ...m, parts: updatedParts } : m
  );
}

/**
 * Get all text parts from a message
 *
 * @param message - Message to extract text from
 * @returns Array of text strings
 */
export function getMessageText(message: MessageWithParts): string[] {
  return message.parts
    .filter((p): p is Extract<Part, { type: "text" }> => p.type === "text")
    .map((p) => p.text);
}

/**
 * Get all tool parts from a message
 *
 * @param message - Message to extract tools from
 * @returns Array of tool parts
 */
export function getMessageTools(message: MessageWithParts) {
  return message.parts.filter(
    (p): p is Extract<Part, { type: "tool" }> => p.type === "tool"
  );
}

/**
 * Check if a message has any text content
 *
 * @param message - Message to check
 * @returns True if message has text parts
 */
export function hasTextContent(message: MessageWithParts): boolean {
  return message.parts.some((p) => p.type === "text" && p.text);
}
