/**
 * Tests for streaming updates hook
 * Basic integration tests to verify the hook initializes correctly
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStreamingUpdates } from "@/hooks/use-streaming-updates";
import { createElement, type ReactNode } from "react";

// Mock the useOpencodeEvents hook
vi.mock("@/hooks/use-opencode-events", () => ({
  useOpencodeEvents: vi.fn(() => ({
    connected: true,
    error: null,
    hasExceededRetries: false,
  })),
}));

describe("useStreamingUpdates", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it("should initialize with connection state", () => {
    const { result } = renderHook(
      () => useStreamingUpdates({ sessionId: "ses_123" }),
      { wrapper }
    );

    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.hasExceededRetries).toBe(false);
  });

  it("should handle undefined sessionId", () => {
    const { result } = renderHook(
      () => useStreamingUpdates({ sessionId: undefined }),
      { wrapper }
    );

    expect(result.current.connected).toBe(true);
  });

  it("should accept onStreamComplete callback", () => {
    const onStreamComplete = vi.fn();
    const { result } = renderHook(
      () => useStreamingUpdates({ sessionId: "ses_123", onStreamComplete }),
      { wrapper }
    );

    expect(result.current.connected).toBe(true);
  });
});
