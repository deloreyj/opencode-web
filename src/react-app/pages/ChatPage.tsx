/**
 * Main Chat Page - Mobile First
 * Responsive chat interface with drawer for mobile and sidebar for desktop
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import { PromptInputHeader } from "@/components/ai-elements/prompt-input";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Actions, Action } from "@/components/ai-elements/actions";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Tool,
  ToolContent,
} from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import { CopyIcon, RefreshCcwIcon, MessageSquareIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon, WrenchIcon, ClockIcon, SettingsIcon, GitCompareIcon, MonitorIcon, HistoryIcon, XIcon } from "lucide-react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useSessions,
  useMessages,
  useCreateSession,
  useSendMessage,
  useDeleteSession,
  useProviders,
  useAgents,
  useOpencodeConfig,
  useSessionUsage,
} from "@/hooks/use-opencode";
import { useStreamingUpdates } from "@/hooks/use-streaming-updates";
import { getMessageText, hasTextContent } from "@/lib/message-cache-utils";
import type { MessageWithParts } from "@/types/opencode-messages";
import { OpencodeStatus } from "@/components/opencode-status";
import { SessionDrawer } from "@/components/chat/session-drawer";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { AgentModeToggle } from "@/components/agent-mode-toggle";
import { getToolContent } from "@/components/chat/tool-contents";
import { WorkspaceSelector } from "@/components/workspace-selector";
import { WorkspaceCreateForm } from "@/components/workspace-create-form";
import { ApiKeySettings } from "@/components/api-key-settings";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DiffViewer as DiffViewerComponent } from "@/components/blocks/diff-viewer/diff-viewer";
import { useWorkspaceDiff } from "@/hooks/use-workspace-diff";
import { useWorkspaceStatus, workspaceStatusKeys } from "@/hooks/use-workspace-status";
import { useWorkspace } from "@/lib/workspace-context";
import { stageAllChanges, stageFile, unstageFile } from "@/lib/workspace-client";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceDiffKeys } from "@/hooks/use-workspace-diff";

type ViewMode = "conversation" | "diff" | "preview";

/**
 * Get status icon for tool call
 */
function getToolStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="size-4 text-green-600" />;
    case "error":
      return <XCircleIcon className="size-4 text-red-600" />;
    case "running":
      return <ClockIcon className="size-4 animate-pulse text-muted-foreground" />;
    default:
      return null;
  }
}

/**
 * Parse git status output to get staged files
 * Git status --porcelain format:
 * XY filename
 * X = staged status, Y = unstaged status
 * M  = staged modification (X position)
 * A  = staged addition
 */
function parseStagedFiles(statusOutput: string): Set<string> {
  const staged = new Set<string>();
  const lines = statusOutput.split('\n').filter(line => line.trim());

  for (const line of lines) {
    if (line.length < 3) continue;

    const stagedStatus = line[0]; // First character = staging area status
    const filepath = line.substring(3); // Skip XY and space

    // If first character is not space, file has staged changes
    if (stagedStatus !== ' ' && stagedStatus !== '?') {
      staged.add(filepath);
    }
  }

  return staged;
}

/**
 * DiffViewer Component
 */
function DiffViewer({
  searchQuery,
  onSearchChange,
  onStageFile,
  onUnstageFile,
  isStaging,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStageFile: (filepath: string) => void;
  onUnstageFile: (filepath: string) => void;
  isStaging: boolean;
}) {
  const { activeWorkspaceId } = useWorkspace();
  const { data: diffData, isLoading, error } = useWorkspaceDiff(activeWorkspaceId);
  const { data: statusData } = useWorkspaceStatus(activeWorkspaceId);

  // Parse staged files from git status
  const stagedFiles = useMemo(() => {
    if (!statusData?.status) return new Set<string>();
    return parseStagedFiles(statusData.status);
  }, [statusData?.status]);

  // Filter the diff by filename - must be before early returns to satisfy Rules of Hooks
  const filteredDiff = useMemo(() => {
    if (!diffData?.diff || !searchQuery.trim()) {
      return diffData?.diff || "";
    }

    // Parse the diff to get individual file sections
    const lines = diffData.diff.split('\n');
    const filteredSections: string[] = [];
    let currentSection: string[] = [];
    let currentFile = '';
    let inSection = false;

    for (const line of lines) {
      // Check if this is a file header
      if (line.startsWith('diff --git')) {
        // Save previous section if it matched
        if (inSection && currentSection.length > 0) {
          filteredSections.push(currentSection.join('\n'));
        }
        // Start new section
        currentSection = [line];
        currentFile = line;
        inSection = currentFile.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        currentSection.push(line);
      }
    }

    // Don't forget the last section
    if (inSection && currentSection.length > 0) {
      filteredSections.push(currentSection.join('\n'));
    }

    return filteredSections.join('\n');
  }, [diffData?.diff, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-sm">Loading git diff...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
        <div className="text-center">
          <GitCompareIcon className="mx-auto mb-4 size-12 text-red-500" />
          <h3 className="mb-2 font-semibold text-lg">Error Loading Diff</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
        <div className="text-center">
          <GitCompareIcon className="mx-auto mb-4 size-12" />
          <h3 className="mb-2 font-semibold text-lg">No Workspace Selected</h3>
          <p className="text-sm">Create or select a workspace to view git changes</p>
        </div>
      </div>
    );
  }

  if (!diffData?.diff || diffData.diff.trim() === "") {
    return (
      <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
        <div className="text-center">
          <GitCompareIcon className="mx-auto mb-4 size-12" />
          <h3 className="mb-2 font-semibold text-lg">No Changes</h3>
          <p className="text-sm">No uncommitted changes in your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl">
          <DiffViewerComponent
            patch={filteredDiff}
            stagedFiles={stagedFiles}
            onStageFile={onStageFile}
            onUnstageFile={onUnstageFile}
            isStaging={isStaging}
          />
        </div>
      </div>
      <div className="shrink-0 border-t bg-card p-2 sm:p-4">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}

/**
 * Stub AppPreview Component
 */
function AppPreview() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
      <div className="text-center">
        <MonitorIcon className="mx-auto mb-4 size-12" />
        <h3 className="mb-2 font-semibold text-lg">UI Preview</h3>
        <p className="text-sm">App preview implementation coming soon</p>
      </div>
    </div>
  );
}

export function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("conversation");
  const [selectedModel, setSelectedModel] = useState<{
    providerID: string;
    modelID: string;
  } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const [diffSearchQuery, setDiffSearchQuery] = useState("");
  const [isStaging, setIsStaging] = useState(false);

  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  // Queries
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: messagesData, isLoading: messagesLoading } = useMessages(currentSessionId);

  // Provide defaults
  const sessionsList = sessions ?? [];
  const messagesList = messagesData ?? [];

  const { data: providersData } = useProviders();
  const { data: agentsData } = useAgents();
  const { data: configData } = useOpencodeConfig();

  // Mutations
  const createSession = useCreateSession();
  const sendMessage = useSendMessage();
  const deleteSession = useDeleteSession();

  // Streaming - update messages in real-time via SSE events
  const { connected: sseConnected, hasExceededRetries } = useStreamingUpdates({
    sessionId: currentSessionId,
    onSessionCreated: useCallback((sessionId: string) => {
      console.log("[ChatPage] Auto-created session on server connect:", sessionId);
      setCurrentSessionId(sessionId);
    }, []),
  });

  // Session usage tracking
  const sessionUsage = useSessionUsage(currentSessionId);

  // Clear session immediately when workspace changes
  // This prevents using a session ID from a different workspace
  useEffect(() => {
    console.log(`[ChatPage] Workspace changed to ${activeWorkspaceId}, clearing current session`);
    setCurrentSessionId(undefined);
  }, [activeWorkspaceId]);

  // Auto-select first session when sessions list changes
  // This runs after the workspace switch and sessions are loaded
  useEffect(() => {
    if (!currentSessionId && sessionsList.length > 0) {
      console.log(`[ChatPage] Auto-selecting first session for workspace ${activeWorkspaceId}`);
      setCurrentSessionId(sessionsList[0].id);
    }
  }, [sessionsList, currentSessionId, activeWorkspaceId]);

  // Set default model
  useEffect(() => {
    if (!selectedModel && providersData) {
      const defaultProvider = providersData.providers[0];
      const defaultModelKey = providersData.default[defaultProvider.id];
      if (defaultProvider && defaultModelKey) {
        setSelectedModel({
          providerID: defaultProvider.id,
          modelID: defaultModelKey,
        });
      }
    }
  }, [providersData, selectedModel]);

  // Set default agent
  useEffect(() => {
    if (!selectedAgent && agentsData) {
      const primaryAgents = agentsData.filter((agent) => agent.mode === "primary" || agent.mode === "all");
      if (primaryAgents.length > 0) {
        setSelectedAgent(primaryAgents[0].name);
      }
    }
  }, [agentsData, selectedAgent]);

  const handleCreateSession = useCallback(async () => {
    const session = await createSession.mutateAsync({
      title: "New Conversation",
    });
    if (session) {
      setCurrentSessionId(session.id);
    }
    setDrawerOpen(false); // Close drawer on mobile after creating
  }, [createSession]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setDrawerOpen(false); // Close drawer on mobile after selecting
  }, []);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    await deleteSession.mutateAsync(sessionId);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(sessionsList.find(s => s.id !== sessionId)?.id);
    }
  }, [deleteSession, currentSessionId, sessionsList]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      // Validate session exists in current workspace
      let sessionId = currentSessionId;
      if (sessionId && sessionsList.length > 0) {
        const sessionExists = sessionsList.some(s => s.id === sessionId);
        if (!sessionExists) {
          console.warn(`[handleSubmit] Session ${sessionId} not found in current workspace, clearing`);
          sessionId = undefined;
          setCurrentSessionId(undefined);
        }
      }

      // Create session if none exists
      if (!sessionId) {
        const session = await createSession.mutateAsync({
          title: message.text?.slice(0, 50) || "New Conversation",
        });
        if (session) {
          sessionId = session.id;
          setCurrentSessionId(session.id);
        } else {
          return; // Failed to create session
        }
      }

      // Build message parts
      const parts: Array<{ type: "text"; text: string } | { type: "file"; mime: string; url: string; filename?: string }> = [];

      if (message.text) {
        parts.push({ type: "text", text: message.text });
      }

      if (message.files) {
        for (const file of message.files) {
          parts.push({
            type: "file",
            mime: file.type,
            url: file.url,
            filename: (file as any).name,
          });
        }
      }

      // Send message
      await sendMessage.mutateAsync({
        sessionId,
        request: {
          model: selectedModel || {
            providerID: "anthropic",
            modelID: "claude-3-5-sonnet-20241022",
          },
          agent: selectedAgent,
          parts,
        },
      });

      setInput("");
    },
    [currentSessionId, sessionsList, selectedModel, selectedAgent, createSession, sendMessage],
  );

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const cycleViewMode = useCallback(() => {
    setViewMode((current) => {
      if (current === "conversation") return "diff";
      if (current === "diff") return "preview";
      return "conversation";
    });
  }, []);

  const handleStageAll = useCallback(async () => {
    if (!activeWorkspaceId) return;

    try {
      setIsStaging(true);
      await stageAllChanges(activeWorkspaceId);

      // Refetch the diff and status after staging
      queryClient.invalidateQueries({ queryKey: workspaceDiffKeys.diff(activeWorkspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceStatusKeys.status(activeWorkspaceId) });
    } catch (err) {
      console.error('Failed to stage changes:', err);
      alert(`Failed to stage changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsStaging(false);
    }
  }, [activeWorkspaceId, queryClient]);

  const handleStageFile = useCallback(async (filepath: string) => {
    if (!activeWorkspaceId) return;

    try {
      setIsStaging(true);
      await stageFile(activeWorkspaceId, filepath);

      // Refetch status after staging
      queryClient.invalidateQueries({ queryKey: workspaceStatusKeys.status(activeWorkspaceId) });
    } catch (err) {
      console.error('Failed to stage file:', err);
      alert(`Failed to stage file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsStaging(false);
    }
  }, [activeWorkspaceId, queryClient]);

  const handleUnstageFile = useCallback(async (filepath: string) => {
    if (!activeWorkspaceId) return;

    try {
      setIsStaging(true);
      await unstageFile(activeWorkspaceId, filepath);

      // Refetch status after unstaging
      queryClient.invalidateQueries({ queryKey: workspaceStatusKeys.status(activeWorkspaceId) });
    } catch (err) {
      console.error('Failed to unstage file:', err);
      alert(`Failed to unstage file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsStaging(false);
    }
  }, [activeWorkspaceId, queryClient]);

  const getViewModeIcon = () => {
    switch (viewMode) {
      case "conversation":
        return <MessageSquareIcon className="size-5" />;
      case "diff":
        return <GitCompareIcon className="size-5" />;
      case "preview":
        return <MonitorIcon className="size-5" />;
    }
  };

  const isLoading = sendMessage.isPending || messagesLoading;

  // Build available models list
  const availableModels = providersData?.providers.flatMap((provider) =>
    Object.entries(provider.models).map(([modelId, model]) => ({
      id: modelId,
      name: model.name,
      providerID: provider.id,
      modelID: modelId,
    }))
  ) || [];

  const currentSession = sessionsList.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Mobile Header */}
      <div className="flex flex-col gap-2 border-b bg-card px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {currentSession?.title || "OpenCode Chat"}
            </h1>
            <div className="hidden sm:block">
              <OpencodeStatus
                sseConnected={sseConnected}
                hasExceededRetries={hasExceededRetries}
                sessionUsage={sessionUsage}
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Status Bar */}
      <div className="border-b bg-card px-3 py-2 sm:hidden">
        <OpencodeStatus 
          sseConnected={sseConnected} 
          hasExceededRetries={hasExceededRetries}
          sessionUsage={sessionUsage}
        />
      </div>

      {/* Content Area - Conversation, Diff, or Preview */}
      {viewMode === "conversation" ? (
        <Conversation className="flex-1">
          <ConversationContent className="px-2 py-2 sm:px-4 sm:py-3">
          {messagesList.length === 0 && !isLoading ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Ask OpenCode to help with your code, explain concepts, or make changes to your project"
              icon={<MessageSquareIcon className="size-10 sm:size-12" />}
            />
          ) : (
            <>
            {messagesList.map((item: MessageWithParts) => {
              const message = item.info;
              const parts = item.parts;


              // Extract sources from parts
              const sources = parts
                .filter((p) => p.type === "file" && p.source)
                .map((p: any) => ({
                  href: p.source.path,
                  title: p.source.path,
                }));

              // Extract reasoning
              const reasoningPart = parts.find((p) => p.type === "reasoning");

              // Extract tool calls
              const toolParts = parts.filter((p) => p.type === "tool");

              return (
                <div key={message.id} className="mb-3">
                  {/* Sources */}
                  {sources.length > 0 && (
                    <Sources>
                      <SourcesTrigger count={sources.length} />
                      <SourcesContent>
                        {sources.map((source) => (
                          <Source
                            href={source.href}
                            key={source.href}
                            title={source.title}
                          />
                        ))}
                      </SourcesContent>
                    </Sources>
                  )}

                  {/* Reasoning */}
                  {reasoningPart && reasoningPart.type === "reasoning" && (
                    <Reasoning
                      duration={
                        reasoningPart.time
                          ? Math.round(
                              (reasoningPart.time.end! - reasoningPart.time.start) / 1000
                            )
                          : undefined
                      }
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{reasoningPart.text}</ReasoningContent>
                    </Reasoning>
                  )}

                  {/* Tool Calls */}
                  {toolParts.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {toolParts.map((toolPart: any) => {
                        const state = toolPart.state;
                        const toolName = toolPart.tool;
                        const description = state.title || "";

                        return (
                          <Tool key={toolPart.id}>
                            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-3">
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <WrenchIcon className="size-4 shrink-0 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  {toolName}
                                </span>
                                {description && (
                                  <span className="min-w-0 truncate text-muted-foreground text-xs">
                                    {description}
                                  </span>
                                )}
                                <span className="shrink-0">
                                  {getToolStatusIcon(state.status)}
                                </span>
                              </div>
                              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <ToolContent>
                              {getToolContent(toolName, state)}
                            </ToolContent>
                          </Tool>
                        );
                      })}
                    </div>
                  )}

                  {/* Message */}
                  {hasTextContent(item) && (
                    <Message from={message.role}>
                      <MessageContent>
                        <Response>
                          {getMessageText(item).join("\n\n")}
                        </Response>
                      </MessageContent>
                      <MessageAvatar
                        src={
                          message.role === "user"
                            ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(configData?.username || "You")}`
                            : "https://github.com/cloudflare.png"
                        }
                        name={message.role === "user" ? (configData?.username || "You") : "OpenCode"}
                      />
                    </Message>
                  )}

                  {/* Actions for assistant messages */}
                  {message.role === "assistant" && hasTextContent(item) && (
                    <Actions className="mt-1.5">
                      <Action
                        onClick={() =>
                          handleCopy(
                            parts
                              .filter((p) => p.type === "text")
                              .map((p: any) => p.text)
                              .join("\n\n")
                          )
                        }
                        label="Copy"
                      >
                        <CopyIcon className="size-3" />
                      </Action>
                      <Action
                        onClick={() => {
                          console.log("Regenerate not yet implemented");
                        }}
                        label="Regenerate"
                      >
                        <RefreshCcwIcon className="size-3" />
                      </Action>
                    </Actions>
                  )}
                </div>
              );
            })}
            </>
          )}
          {isLoading && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : viewMode === "diff" ? (
        <div className="flex-1 overflow-auto">
          <DiffViewer
            searchQuery={diffSearchQuery}
            onSearchChange={setDiffSearchQuery}
            onStageFile={handleStageFile}
            onUnstageFile={handleUnstageFile}
            isStaging={isStaging}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <AppPreview />
        </div>
      )}

      {/* Input - Mobile Optimized */}
      <div className="border-t bg-card p-2 sm:p-4">
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cycleViewMode}
                className="h-8 gap-2 sm:h-9"
                title={`Switch view (current: ${viewMode})`}
              >
                {getViewModeIcon()}
                <span className="text-xs font-medium sm:text-sm">
                  {viewMode === "conversation" ? "Chat" : viewMode === "diff" ? "Diff" : "App"}
                </span>
              </Button>
              {viewMode === "diff" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStageAll}
                  disabled={isStaging || !activeWorkspaceId}
                  className="h-8 sm:h-9"
                >
                  {isStaging ? "Staging..." : "Stage All"}
                </Button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDrawerOpen(true)}
                className="h-8 w-8 sm:h-9 sm:w-9"
                title="Conversation history"
              >
                <HistoryIcon className="size-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="h-8 w-8 sm:h-9 sm:w-9"
                title="Settings"
              >
                <SettingsIcon className="size-5" />
              </Button>
            </div>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Ask OpenCode anything..."
              className="min-h-[44px] text-base sm:text-sm"
            />
          </PromptInputBody>
          <PromptInputFooter className="gap-1 sm:gap-2">
            <PromptInputTools className="gap-1 sm:gap-2">
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger className="h-8 w-8 sm:h-9 sm:w-9" />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <AgentModeToggle
                selectedAgent={selectedAgent}
                onAgentChange={setSelectedAgent}
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
              <PromptInputModelSelect
                onValueChange={(value) => {
                  const [providerID, modelID] = value.split("/");
                  setSelectedModel({ providerID, modelID });
                }}
                value={
                  selectedModel
                    ? `${selectedModel.providerID}/${selectedModel.modelID}`
                    : undefined
                }
              >
                <PromptInputModelSelectTrigger className="h-8 text-xs sm:h-9 sm:text-sm">
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {availableModels.map((model) => (
                    <PromptInputModelSelectItem
                      key={`${model.providerID}/${model.modelID}`}
                      value={`${model.providerID}/${model.modelID}`}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input.trim()}
              status={sendMessage.isPending ? "submitted" : "ready"}
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>

      {/* Session Drawer */}
      <SessionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        sessions={sessionsList}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isLoading={sessionsLoading}
      />

      {/* Settings Drawer */}
      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-left">Settings</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XIcon className="size-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-sm">Workspace</h3>
                <div className="flex items-center gap-2 min-w-0">
                  <WorkspaceSelector />
                  <WorkspaceCreateForm />
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-sm">API Keys</h3>
                <ApiKeySettings />
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
