/**
 * OpenCode Client Utility
 *
 * Provides a type-safe client for interacting with the OpenCode server.
 * This connects to a running OpenCode server instance (local or containerized).
 */

import { createOpencodeClient } from "@opencode-ai/sdk/client";
import type {
  Session,
  Message,
  Part,
  Config,
  Provider,
  Agent,
  SessionPromptData,
  SessionCommandData,
  TextPartInput,
  FilePartInput,
  AgentPartInput,
} from "@opencode-ai/sdk/client";

// Export types for use throughout the app
export type {
  Session,
  Message,
  Part,
  Config,
  Provider,
  Agent,
  SessionPromptData,
  SessionCommandData,
  TextPartInput,
  FilePartInput,
  AgentPartInput,
};

// Helper type for chat message input (SessionPromptData body)
export type ChatMessageInput = NonNullable<SessionPromptData["body"]>;

// Helper type for command input (SessionCommandData body)
export type CommandInput = NonNullable<SessionCommandData["body"]>;

/**
 * Get the OpenCode server URL from environment variables.
 * Falls back to localhost:4096 for local development.
 */
function getOpencodeUrl(): string {
  // In production (Cloudflare Workers), this will be the container URL
  if (typeof import.meta.env.VITE_OPENCODE_URL === "string") {
    return import.meta.env.VITE_OPENCODE_URL;
  }

  // Development fallback
  return "http://127.0.0.1:4096";
}

/**
 * Create an OpenCode client instance.
 * This client connects to a running OpenCode server.
 */
export function createClient() {
  const baseUrl = getOpencodeUrl();

  const client = createOpencodeClient({
    baseUrl,
    throwOnError: false, // Handle errors manually
  });

  return client;
}

/**
 * Singleton client instance for the application.
 * Use this throughout your app to interact with OpenCode.
 */
export const opencodeClient = createClient();

/**
 * Helper function to check if the OpenCode server is available.
 */
export async function isServerAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${getOpencodeUrl()}/doc`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Helper function to get server configuration.
 */
export async function getServerInfo() {
  try {
    const { data, error } = await opencodeClient.config.get();
    if (error) {
      console.error("Failed to get server info:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Failed to connect to OpenCode server:", err);
    return null;
  }
}
