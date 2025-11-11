/**
 * Tests for OpenCode event utilities
 */

import { describe, it, expect } from "vitest";
import {
  getEventSessionId,
  isEventForSession,
  getMessageInfo,
  getPartInfo,
  isMessageUpdatedEvent,
  isMessagePartUpdatedEvent,
} from "@/hooks/opencode-event-utils";

describe("opencode-event-utils", () => {
  describe("getEventSessionId", () => {
    it("should extract sessionID from properties.info", () => {
      const event = {
        type: "message.updated",
        properties: {
          info: {
            sessionID: "ses_123",
            id: "msg_456",
          },
        },
      } as any;

      expect(getEventSessionId(event)).toBe("ses_123");
    });

    it("should extract sessionID from properties.part.sessionID", () => {
      const event = {
        type: "message.part.updated",
        properties: {
          part: {
            sessionID: "ses_123",
            messageID: "msg_123",
            id: "prt_789",
          },
        },
      } as any;

      // Part events have sessionID directly on the part
      expect(getEventSessionId(event)).toBe("ses_123");
    });

    it("should extract sessionID from properties", () => {
      const event = {
        type: "session.idle",
        properties: {
          sessionID: "ses_123",
        },
      } as any;

      expect(getEventSessionId(event)).toBe("ses_123");
    });

    it("should return undefined if no sessionID found", () => {
      const event = {
        type: "server.connected",
        properties: {},
      } as any;

      expect(getEventSessionId(event)).toBeUndefined();
    });
  });

  describe("isEventForSession", () => {
    it("should return true when no sessionId filter is provided", () => {
      const event = {
        type: "message.updated",
        properties: {
          info: { sessionID: "ses_123" },
        },
      } as any;

      expect(isEventForSession(event, undefined)).toBe(true);
    });

    it("should return true when event has no sessionID", () => {
      const event = {
        type: "server.connected",
        properties: {},
      } as any;

      expect(isEventForSession(event, "ses_123")).toBe(true);
    });

    it("should return true when sessionIDs match", () => {
      const event = {
        type: "message.updated",
        properties: {
          info: { sessionID: "ses_123" },
        },
      } as any;

      expect(isEventForSession(event, "ses_123")).toBe(true);
    });

    it("should return false when sessionIDs don't match", () => {
      const event = {
        type: "message.updated",
        properties: {
          info: { sessionID: "ses_123" },
        },
      } as any;

      expect(isEventForSession(event, "ses_456")).toBe(false);
    });
  });

  describe("getMessageInfo", () => {
    it("should extract message info from message.updated event", () => {
      const event = {
        type: "message.updated",
        properties: {
          info: {
            id: "msg_123",
            role: "assistant",
            sessionID: "ses_456",
          },
        },
      } as any;

      const info = getMessageInfo(event);
      expect(info).toEqual({
        id: "msg_123",
        role: "assistant",
        sessionID: "ses_456",
      });
    });

    it("should return null for non-message.updated events", () => {
      const event = {
        type: "session.idle",
        properties: {},
      } as any;

      expect(getMessageInfo(event)).toBeNull();
    });
  });

  describe("getPartInfo", () => {
    it("should extract part info from message.part.updated event", () => {
      const event = {
        type: "message.part.updated",
        properties: {
          part: {
            id: "prt_123",
            type: "text",
            text: "Hello world",
            messageID: "msg_456",
          },
        },
      } as any;

      const part = getPartInfo(event);
      expect(part).toEqual({
        id: "prt_123",
        type: "text",
        text: "Hello world",
        messageID: "msg_456",
      });
    });

    it("should return null for non-message.part.updated events", () => {
      const event = {
        type: "message.updated",
        properties: {},
      } as any;

      expect(getPartInfo(event)).toBeNull();
    });
  });

  describe("Type Guards", () => {
    it("isMessageUpdatedEvent should identify message.updated events", () => {
      const event = {
        type: "message.updated",
        properties: {
          info: {
            id: "msg_123",
            role: "assistant",
            sessionID: "ses_456",
          },
        },
      } as any;

      expect(isMessageUpdatedEvent(event)).toBe(true);
    });

    it("isMessagePartUpdatedEvent should identify message.part.updated events", () => {
      const event = {
        type: "message.part.updated",
        properties: {
          part: {
            id: "prt_123",
            type: "text",
            text: "Hello",
            messageID: "msg_456",
          },
        },
      } as any;

      expect(isMessagePartUpdatedEvent(event)).toBe(true);
    });

    it("type guards should return false for non-matching events", () => {
      const event = {
        type: "session.idle",
        properties: {},
      } as any;

      expect(isMessageUpdatedEvent(event)).toBe(false);
      expect(isMessagePartUpdatedEvent(event)).toBe(false);
    });
  });
});
