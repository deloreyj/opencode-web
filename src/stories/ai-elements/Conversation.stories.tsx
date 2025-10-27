import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageAvatar } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { MessageCircleIcon } from "lucide-react";

const meta = {
  title: "AI Elements/Conversation",
  component: Conversation,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleMessages = () => (
  <>
    <Message from="user">
      <MessageContent>
        <Response>Hello! Can you help me understand React hooks?</Response>
      </MessageContent>
      <MessageAvatar src="https://github.com/shadcn.png" name="User" />
    </Message>
    <Message from="assistant">
      <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
      <MessageContent>
        <Response>
          Of course! React hooks are functions that let you use state and other React features in function components. The most common hooks are useState for managing state and useEffect for handling side effects.
        </Response>
      </MessageContent>
    </Message>
    <Message from="user">
      <MessageContent>
        <Response>Can you show me an example of useState?</Response>
      </MessageContent>
      <MessageAvatar src="https://github.com/shadcn.png" name="User" />
    </Message>
    <Message from="assistant">
      <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
      <MessageContent>
        <Response>{`Here's a simple example:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

This creates a state variable \`count\` with an initial value of 0, and a function \`setCount\` to update it.`}</Response>
      </MessageContent>
    </Message>
  </>
);

export const Default: Story = {
  render: () => (
    <div className="h-[600px]">
      <Conversation>
        <ConversationContent>
          <SampleMessages />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="h-[600px]">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState />
        </ConversationContent>
      </Conversation>
    </div>
  ),
};

export const EmptyWithCustomContent: Story = {
  render: () => (
    <div className="h-[600px]">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState
            title="Start a conversation"
            description="Ask me anything about your code"
            icon={<MessageCircleIcon className="size-12" />}
          />
        </ConversationContent>
      </Conversation>
    </div>
  ),
};

export const LongConversation: Story = {
  render: () => (
    <div className="h-[600px]">
      <Conversation>
        <ConversationContent>
          <SampleMessages />
          <SampleMessages />
          <SampleMessages />
          <SampleMessages />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  ),
};
