/**
 * Main Chat Page
 * Full-featured chat interface for interacting with OpenCode agent
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
  PromptInputButton,
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
import { Loader } from "@/components/ai-elements/loader";
import { CopyIcon, RefreshCcwIcon, MessageSquareIcon } from "lucide-react";
import {
  useSessions,
  useMessages,
  useCreateSession,
  useSendMessage,
  useProviders,
} from "@/hooks/use-opencode";
import { OpencodeStatus } from "@/components/opencode-status";
import { SessionSidebar } from "@/components/chat/session-sidebar";

export function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<{
    providerID: string;
    modelID: string;
  } | null>(null);

  // Queries
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: messagesData = [], isLoading: messagesLoading } = useMessages(currentSessionId);
  const { data: providersData } = useProviders();

  // Mutations
  const createSession = useCreateSession();
  const sendMessage = useSendMessage();

  // Set default session on mount
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);

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

  const handleCreateSession = useCallback(async () => {
    const session = await createSession.mutateAsync({
      title: "New Conversation",
    });
    setCurrentSessionId(session.id);
  }, [createSession]);

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
        sessionId = session.id;
        setCurrentSessionId(session.id);
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
            filename: file.name,
          });
        }
      }

      // Send message
      await sendMessage.mutateAsync({
        sessionId,
        message: {
          model: selectedModel || {
            providerID: "anthropic",
            modelID: "claude-3-5-sonnet-20241022",
          },
          parts,
        },
      });

      setInput("");
    },
    [currentSessionId, selectedModel, createSession, sendMessage],
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

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onCreateSession={handleCreateSession}
        isLoading={sessionsLoading}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-card px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">OpenCode Chat</h1>
            <p className="text-sm text-muted-foreground">
              {currentSessionId
                ? sessions.find((s) => s.id === currentSessionId)?.title
                : "No session selected"}
            </p>
          </div>
          <OpencodeStatus />
        </div>

        {/* Messages */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messagesData.length === 0 && !isLoading ? (
              <ConversationEmptyState
                title="Start a conversation"
                description="Ask OpenCode to help with your code, explain concepts, or make changes to your project"
                icon={<MessageSquareIcon className="size-12" />}
              />
            ) : (
              messagesData.map((item) => {
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

                return (
                  <div key={message.id}>
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

                    {/* Message */}
                    <Message from={message.role}>
                      <MessageContent>
                        <Response>
                          {parts
                            .filter((p) => p.type === "text")
                            .map((p: any) => p.text)
                            .join("\n\n")}
                        </Response>
                      </MessageContent>
                      <MessageAvatar
                        src={
                          message.role === "user"
                            ? "https://github.com/shadcn.png"
                            : "https://github.com/cloudflare.png"
                        }
                        name={message.role === "user" ? "You" : "OpenCode"}
                      />
                    </Message>

                    {/* Actions for assistant messages */}
                    {message.role === "assistant" && (
                      <Actions className="mt-2">
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
                            // TODO: Implement regenerate
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
              })
            )}
            {isLoading && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input */}
        <div className="border-t bg-card p-4">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Ask OpenCode anything..."
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
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
                  <PromptInputModelSelectTrigger>
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
                disabled={!input.trim() && !sendMessage.isPending}
                status={
                  sendMessage.isPending
                    ? "streaming"
                    : messagesLoading
                      ? "submitted"
                      : "ready"
                }
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
