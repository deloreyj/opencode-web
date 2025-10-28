/**
 * OpenCode Server-Sent Events Types
 * Re-export actual types from OpenCode SDK
 */

export type {
  Event as OpencodeEvent,
  EventMessageUpdated,
  EventMessageRemoved,
  EventMessagePartUpdated,
  EventMessagePartRemoved,
  EventSessionUpdated,
  EventSessionDeleted,
  EventSessionError,
  EventSessionIdle,
  EventPermissionUpdated,
  EventPermissionReplied,
  EventFileEdited,
  EventFileWatcherUpdated,
  EventTodoUpdated,
  EventServerConnected,
  EventSessionCompacted,
  EventLspClientDiagnostics,
  EventInstallationUpdated,
  EventIdeInstalled,
} from "@opencode-ai/sdk/client";
