/**
 * Tests for message cache utility functions
 */

import { describe, it, expect } from "vitest";
import {
  upsertMessage,
  upsertMessagePart,
  removeMessage,
  removeMessagePart,
  getMessageText,
  getMessageTools,
  hasTextContent,
} from "@/lib/message-cache-utils";
import type { MessageWithParts } from "@/types/opencode-messages";
import type { Message, Part } from "@opencode-ai/sdk/client";

// Helper to create mock messages
function createMockMessage(id: string, role: "user" | "assistant" = "assistant"): Message {
  return {
    id,
    sessionID: "ses_123",
    role,
    time: { created: Date.now() },
    system: [],
    parentID: "",
    modelID: "model_1",
    providerID: "provider_1",
    mode: "primary",
    path: { cwd: "/", root: "/" },
    cost: 0,
    tokens: { input: 0, output: 0 },
    parts: [],
  } as Message;
}

// Helper to create mock text part
function createMockTextPart(id: string, text: string, messageID: string): Part & { messageID: string } {
  return {
    id,
    type: "text",
    text,
    messageID,
  } as Part & { messageID: string };
}

// Helper to create mock tool part
function createMockToolPart(id: string, messageID: string): Part & { messageID: string } {
  return {
    id,
    type: "tool",
    tool: "test-tool",
    state: { status: "completed" },
    messageID,
  } as Part & { messageID: string };
}

describe("message-cache-utils", () => {
  describe("upsertMessage", () => {
    it("should add new message to empty array", () => {
      const messages: MessageWithParts[] = [];
      const newMessage = createMockMessage("msg_1");

      const result = upsertMessage(messages, newMessage);

      expect(result).toHaveLength(1);
      expect(result[0].info).toEqual(newMessage);
      expect(result[0].parts).toEqual([]);
    });

    it("should add new message to existing array", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];
      const newMessage = createMockMessage("msg_2");

      const result = upsertMessage(messages, newMessage);

      expect(result).toHaveLength(2);
      expect(result[1].info.id).toBe("msg_2");
    });

    it("should update existing message", () => {
      const originalMessage = createMockMessage("msg_1", "assistant");
      const messages: MessageWithParts[] = [
        { info: originalMessage, parts: [] },
      ];

      const updatedMessage = { ...originalMessage, cost: 100 };
      const result = upsertMessage(messages, updatedMessage);

      expect(result).toHaveLength(1);
      expect(result[0].info.cost).toBe(100);
    });

    it("should not mutate original array", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];
      const newMessage = createMockMessage("msg_2");

      const result = upsertMessage(messages, newMessage);

      expect(result).not.toBe(messages);
      expect(messages).toHaveLength(1); // Original unchanged
    });

    it("should preserve parts when updating message", () => {
      const existingPart = createMockTextPart("prt_1", "Hello", "msg_1");
      const messages: MessageWithParts[] = [
        {
          info: createMockMessage("msg_1"),
          parts: [existingPart],
        },
      ];

      const updatedMessage = { ...createMockMessage("msg_1"), cost: 50 };
      const result = upsertMessage(messages, updatedMessage);

      expect(result[0].parts).toHaveLength(1);
      expect(result[0].parts[0]).toEqual(existingPart);
    });
  });

  describe("upsertMessagePart", () => {
    it("should add new part to message", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];
      const newPart = createMockTextPart("prt_1", "Hello", "msg_1");

      const result = upsertMessagePart(messages, newPart);

      expect(result[0].parts).toHaveLength(1);
      expect(result[0].parts[0]).toEqual(newPart);
    });

    it("should update existing part", () => {
      const existingPart = createMockTextPart("prt_1", "Hello", "msg_1");
      const messages: MessageWithParts[] = [
        {
          info: createMockMessage("msg_1"),
          parts: [existingPart],
        },
      ];

      const updatedPart = createMockTextPart("prt_1", "Hello world", "msg_1");
      const result = upsertMessagePart(messages, updatedPart);

      expect(result[0].parts).toHaveLength(1);
      expect((result[0].parts[0] as any).text).toBe("Hello world");
    });

    it("should append part when part ID is new", () => {
      const part1 = createMockTextPart("prt_1", "Hello", "msg_1");
      const messages: MessageWithParts[] = [
        {
          info: createMockMessage("msg_1"),
          parts: [part1],
        },
      ];

      const part2 = createMockTextPart("prt_2", "World", "msg_1");
      const result = upsertMessagePart(messages, part2);

      expect(result[0].parts).toHaveLength(2);
      expect((result[0].parts[1] as any).text).toBe("World");
    });

    it("should return unchanged array if message not found", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];
      const part = createMockTextPart("prt_1", "Hello", "msg_999");

      const result = upsertMessagePart(messages, part);

      expect(result).toBe(messages); // Same reference
    });

    it("should not mutate original array", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];
      const part = createMockTextPart("prt_1", "Hello", "msg_1");

      const result = upsertMessagePart(messages, part);

      expect(result).not.toBe(messages);
      expect(messages[0].parts).toHaveLength(0); // Original unchanged
    });
  });

  describe("removeMessage", () => {
    it("should remove message by ID", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
        { info: createMockMessage("msg_2"), parts: [] },
      ];

      const result = removeMessage(messages, "msg_1");

      expect(result).toHaveLength(1);
      expect(result[0].info.id).toBe("msg_2");
    });

    it("should return unchanged array if message not found", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];

      const result = removeMessage(messages, "msg_999");

      expect(result).toHaveLength(1);
      expect(result[0].info.id).toBe("msg_1");
    });

    it("should not mutate original array", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
        { info: createMockMessage("msg_2"), parts: [] },
      ];

      const result = removeMessage(messages, "msg_1");

      expect(result).not.toBe(messages);
      expect(messages).toHaveLength(2); // Original unchanged
    });
  });

  describe("removeMessagePart", () => {
    it("should remove part from message", () => {
      const part1 = createMockTextPart("prt_1", "Hello", "msg_1");
      const part2 = createMockTextPart("prt_2", "World", "msg_1");
      const messages: MessageWithParts[] = [
        {
          info: createMockMessage("msg_1"),
          parts: [part1, part2],
        },
      ];

      const result = removeMessagePart(messages, "prt_1", "msg_1");

      expect(result[0].parts).toHaveLength(1);
      expect(result[0].parts[0].id).toBe("prt_2");
    });

    it("should return unchanged array if message not found", () => {
      const messages: MessageWithParts[] = [
        { info: createMockMessage("msg_1"), parts: [] },
      ];

      const result = removeMessagePart(messages, "prt_1", "msg_999");

      expect(result).toBe(messages);
    });

    it("should not mutate original array", () => {
      const part = createMockTextPart("prt_1", "Hello", "msg_1");
      const messages: MessageWithParts[] = [
        {
          info: createMockMessage("msg_1"),
          parts: [part],
        },
      ];

      const result = removeMessagePart(messages, "prt_1", "msg_1");

      expect(result).not.toBe(messages);
      expect(messages[0].parts).toHaveLength(1); // Original unchanged
    });
  });

  describe("getMessageText", () => {
    it("should extract text from text parts", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [
          createMockTextPart("prt_1", "Hello", "msg_1"),
          createMockTextPart("prt_2", "World", "msg_1"),
        ],
      };

      const result = getMessageText(messages);

      expect(result).toEqual(["Hello", "World"]);
    });

    it("should filter out non-text parts", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [
          createMockTextPart("prt_1", "Hello", "msg_1"),
          createMockToolPart("prt_2", "msg_1"),
        ],
      };

      const result = getMessageText(messages);

      expect(result).toEqual(["Hello"]);
    });

    it("should return empty array if no text parts", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [createMockToolPart("prt_1", "msg_1")],
      };

      const result = getMessageText(messages);

      expect(result).toEqual([]);
    });
  });

  describe("getMessageTools", () => {
    it("should extract tool parts", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [
          createMockToolPart("prt_1", "msg_1"),
          createMockTextPart("prt_2", "Hello", "msg_1"),
        ],
      };

      const result = getMessageTools(messages);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("tool");
    });
  });

  describe("hasTextContent", () => {
    it("should return true if message has text", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [createMockTextPart("prt_1", "Hello", "msg_1")],
      };

      expect(hasTextContent(messages)).toBe(true);
    });

    it("should return false if message has no text", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [createMockToolPart("prt_1", "msg_1")],
      };

      expect(hasTextContent(messages)).toBe(false);
    });

    it("should return false if message has empty text", () => {
      const messages: MessageWithParts = {
        info: createMockMessage("msg_1"),
        parts: [createMockTextPart("prt_1", "", "msg_1")],
      };

      expect(hasTextContent(messages)).toBe(false);
    });
  });
});
