import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector,
} from "@/components/ai-elements/branch";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
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
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Suggestion,
  Suggestions,
} from "@/components/ai-elements/suggestion";
import { Actions, Action } from "@/components/ai-elements/actions";
import { Loader } from "@/components/ai-elements/loader";
import { GlobeIcon, CopyIcon, RefreshCcwIcon } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";

const meta = {
  title: "AI Elements/Chatbot Example",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type MessageType = {
  key: string;
  from: "user" | "assistant";
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  avatar: string;
  name: string;
};

const initialMessages: MessageType[] = [
  {
    key: nanoid(),
    from: "user",
    versions: [
      {
        id: nanoid(),
        content: "Can you explain how to use React hooks effectively?",
      },
    ],
    avatar: "https://github.com/shadcn.png",
    name: "User",
  },
  {
    key: nanoid(),
    from: "assistant",
    sources: [
      {
        href: "https://react.dev/reference/react",
        title: "React Documentation",
      },
      {
        href: "https://react.dev/reference/react-dom",
        title: "React DOM Documentation",
      },
    ],
    versions: [
      {
        id: nanoid(),
        content: `# React Hooks Best Practices

React hooks are a powerful feature that let you use state and other React features without writing classes. Here are some tips for using them effectively:

## Rules of Hooks

1. **Only call hooks at the top level** of your component or custom hooks
2. **Don't call hooks inside loops, conditions, or nested functions**

## Common Hooks

- **useState**: For local component state
- **useEffect**: For side effects like data fetching
- **useContext**: For consuming context
- **useReducer**: For complex state logic

## Example

\`\`\`jsx
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(userData => {
      setUser(userData);
    });
  }, [userId]);

  return user ? <Profile user={user} /> : <Loading />;
}
\`\`\`

Would you like me to explain any specific hook in more detail?`,
      },
    ],
    avatar: "https://github.com/vercel.png",
    name: "Assistant",
  },
  {
    key: nanoid(),
    from: "user",
    versions: [
      {
        id: nanoid(),
        content:
          "Yes, could you explain useCallback and useMemo in more detail?",
      },
      {
        id: nanoid(),
        content:
          "I'm particularly interested in the performance implications of useCallback and useMemo.",
      },
      {
        id: nanoid(),
        content:
          "Could you dive deeper into useCallback and useMemo use cases?",
      },
    ],
    avatar: "https://github.com/shadcn.png",
    name: "User",
  },
  {
    key: nanoid(),
    from: "assistant",
    reasoning: {
      content: `The user is asking for a detailed explanation of useCallback and useMemo. I should provide clear explanations of each hook's purpose and how they differ.

The useCallback hook memoizes functions to prevent unnecessary re-renders of child components.

The useMemo hook memoizes values to avoid expensive recalculations.

Both help with performance optimization but serve different purposes.`,
      duration: 8,
    },
    versions: [
      {
        id: nanoid(),
        content: `## useCallback vs useMemo

Both hooks help with performance optimization, but they serve different purposes:

### useCallback

\`useCallback\` memoizes **functions** to prevent unnecessary re-renders:

\`\`\`jsx
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
\`\`\`

### useMemo

\`useMemo\` memoizes **values** to avoid expensive recalculations:

\`\`\`jsx
const sortedList = useMemo(() => expensiveSort(items), [items]);
\`\`\`

### When to use which?

- Use **useCallback** when passing callbacks to optimized child components
- Use **useMemo** when you have computationally expensive calculations

Don't overuse these hooks - they come with their own overhead!`,
      },
    ],
    avatar: "https://github.com/vercel.png",
    name: "Assistant",
  },
];

const models = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "claude-2", name: "Claude 2" },
];

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
];

const mockResponses = [
  "That's a great question! Let me help you understand this concept better.",
  "I'd be happy to explain this topic in detail. Here's what you need to know...",
  "This is an interesting topic. Let me break it down step by step for you.",
];

export const FullChatbot: Story = {
  render: () => {
    const [model, setModel] = useState<string>(models[0].id);
    const [text, setText] = useState<string>("");
    const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
    const [status, setStatus] = useState<
      "submitted" | "streaming" | "ready" | "error"
    >("ready");
    const [messages, setMessages] = useState<MessageType[]>(initialMessages);
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
      null,
    );
    const shouldCancelRef = useRef<boolean>(false);
    const addMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const stop = useCallback(() => {
      shouldCancelRef.current = true;
      if (addMessageTimeoutRef.current) {
        clearTimeout(addMessageTimeoutRef.current);
        addMessageTimeoutRef.current = null;
      }
      setStatus("ready");
      setStreamingMessageId(null);
    }, []);

    const streamResponse = useCallback(
      async (messageId: string, content: string) => {
        setStatus("streaming");
        setStreamingMessageId(messageId);
        shouldCancelRef.current = false;

        const words = content.split(" ");
        let currentContent = "";

        for (let i = 0; i < words.length; i++) {
          if (shouldCancelRef.current) {
            setStatus("ready");
            setStreamingMessageId(null);
            return;
          }

          currentContent += (i > 0 ? " " : "") + words[i];

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.versions.some((v) => v.id === messageId)) {
                return {
                  ...msg,
                  versions: msg.versions.map((v) =>
                    v.id === messageId ? { ...v, content: currentContent } : v,
                  ),
                };
              }
              return msg;
            }),
          );

          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 100 + 50),
          );
        }

        setStatus("ready");
        setStreamingMessageId(null);
      },
      [],
    );

    const addUserMessage = useCallback(
      (content: string) => {
        const userMessage: MessageType = {
          key: `user-${Date.now()}`,
          from: "user",
          versions: [
            {
              id: `user-${Date.now()}`,
              content,
            },
          ],
          avatar: "https://github.com/shadcn.png",
          name: "User",
        };

        setMessages((prev) => [...prev, userMessage]);

        addMessageTimeoutRef.current = setTimeout(() => {
          const assistantMessageId = `assistant-${Date.now()}`;
          const randomResponse =
            mockResponses[Math.floor(Math.random() * mockResponses.length)];

          const assistantMessage: MessageType = {
            key: `assistant-${Date.now()}`,
            from: "assistant",
            versions: [
              {
                id: assistantMessageId,
                content: "",
              },
            ],
            avatar: "https://github.com/vercel.png",
            name: "Assistant",
          };

          setMessages((prev) => [...prev, assistantMessage]);
          streamResponse(assistantMessageId, randomResponse);
          addMessageTimeoutRef.current = null;
        }, 500);
      },
      [streamResponse],
    );

    const handleSubmit = (message: PromptInputMessage) => {
      if (status === "streaming" || status === "submitted") {
        stop();
        return;
      }

      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      setStatus("submitted");
      addUserMessage(message.text || "Sent with attachments");
      setText("");
    };

    const handleSuggestionClick = (suggestion: string) => {
      setStatus("submitted");
      addUserMessage(suggestion);
    };

    const handleCopy = (content: string) => {
      navigator.clipboard.writeText(content);
    };

    const handleRegenerate = () => {
      // In a real app, this would regenerate the last assistant message
      console.log("Regenerate last message");
    };

    return (
      <div className="relative flex size-full flex-col divide-y overflow-hidden h-screen">
        <Conversation>
          <ConversationContent>
            {messages.map(({ versions, ...message }) => (
              <Branch defaultBranch={0} key={message.key}>
                <BranchMessages>
                  {versions.map((version) => (
                    <div key={`${message.key}-${version.id}`}>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <Message from={message.from}>
                        <MessageContent>
                          <Response>{version.content}</Response>
                        </MessageContent>
                        <MessageAvatar
                          name={message.name}
                          src={message.avatar}
                        />
                      </Message>
                      {message.from === "assistant" && (
                        <Actions className="mt-2">
                          <Action
                            onClick={() => handleCopy(version.content)}
                            label="Copy"
                          >
                            <CopyIcon className="size-3" />
                          </Action>
                          <Action
                            onClick={handleRegenerate}
                            label="Regenerate"
                          >
                            <RefreshCcwIcon className="size-3" />
                          </Action>
                        </Actions>
                      )}
                    </div>
                  ))}
                </BranchMessages>
                {versions.length > 1 && (
                  <BranchSelector from={message.from}>
                    <BranchPrevious />
                    <BranchPage />
                    <BranchNext />
                  </BranchSelector>
                )}
              </Branch>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="grid shrink-0 gap-4 pt-4">
          <Suggestions className="px-4">
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
          <div className="w-full px-4 pb-4">
            <PromptInput globalDrop multiple onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea
                  onChange={(event) => setText(event.target.value)}
                  ref={textareaRef}
                  value={text}
                  placeholder="Ask me anything..."
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
                  <PromptInputButton
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    variant={useWebSearch ? "default" : "ghost"}
                  >
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </PromptInputButton>
                  <PromptInputModelSelect
                    onValueChange={setModel}
                    value={model}
                  >
                    <PromptInputModelSelectTrigger>
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      {models.map((model) => (
                        <PromptInputModelSelectItem
                          key={model.id}
                          value={model.id}
                        >
                          {model.name}
                        </PromptInputModelSelectItem>
                      ))}
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit
                  disabled={
                    (!text.trim() && !status) || status === "streaming"
                  }
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    );
  },
};
