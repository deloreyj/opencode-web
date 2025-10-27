import type { Meta, StoryObj } from "@storybook/react-vite";
import { Message, MessageContent, MessageAvatar } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

const meta = {
  title: "AI Elements/Message",
  component: Message,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="user">
        <MessageContent>
          <Response>Hello! Can you help me understand React hooks?</Response>
        </MessageContent>
        <MessageAvatar src="https://github.com/shadcn.png" name="User" />
      </Message>
    </div>
  ),
};

export const AssistantMessage: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="assistant">
        <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
        <MessageContent>
          <Response>
            Of course! React hooks are functions that let you use state and other React features in function components. The most common hooks are useState and useEffect.
          </Response>
        </MessageContent>
      </Message>
    </div>
  ),
};

export const MessageWithCode: Story = {
  render: () => (
    <div className="w-[600px]">
      <Message from="assistant">
        <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
        <MessageContent>
          <Response>{`Here's an example of useState:

\`\`\`javascript
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1);
}
\`\`\``}</Response>
        </MessageContent>
      </Message>
    </div>
  ),
};

export const FlatVariant: Story = {
  render: () => (
    <div className="w-[600px] space-y-4">
      <Message from="user">
        <MessageContent variant="flat">
          <Response>This is a flat user message</Response>
        </MessageContent>
        <MessageAvatar src="https://github.com/shadcn.png" name="User" />
      </Message>
      <Message from="assistant">
        <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
        <MessageContent variant="flat">
          <Response>This is a flat assistant message</Response>
        </MessageContent>
      </Message>
    </div>
  ),
};
