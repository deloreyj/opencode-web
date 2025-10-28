/**
 * Main Chat Page - Mobile First
 * Responsive chat interface with drawer for mobile and sidebar for desktop
 */

import { useState, useCallback, useEffect } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
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
import { CopyIcon, RefreshCcwIcon, MessageSquareIcon, MenuIcon, PlusIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon, WrenchIcon, ClockIcon } from "lucide-react";
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

export function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<{
    providerID: string;
    modelID: string;
  } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();

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
  });

  // Session usage tracking
  const sessionUsage = useSessionUsage(currentSessionId);

  // Set default session on mount
  useEffect(() => {
    if (!currentSessionId && sessionsList.length > 0) {
      setCurrentSessionId(sessionsList[0].id);
    }
  }, [sessionsList, currentSessionId]);

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

      // Create session if none exists
      let sessionId = currentSessionId;
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
    [currentSessionId, selectedModel, selectedAgent, createSession, sendMessage],
  );

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

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
      <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(true)}
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          >
            <MenuIcon className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>
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
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCreateSession}
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          >
            <PlusIcon className="size-5" />
            <span className="sr-only">New chat</span>
          </Button>
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

      {/* Messages */}
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

      {/* Input - Mobile Optimized */}
      <div className="border-t bg-card p-2 sm:p-4">
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
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
    </div>
  );
}
