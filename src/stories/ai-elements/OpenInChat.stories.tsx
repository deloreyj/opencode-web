import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  OpenIn,
  OpenInTrigger,
  OpenInContent,
  OpenInLabel,
  OpenInSeparator,
  OpenInChatGPT,
  OpenInClaude,
  OpenInCursor,
  OpenInv0,
} from "@/components/ai-elements/open-in-chat";

const meta = {
  title: "AI Elements/OpenInChat",
  component: OpenIn,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof OpenIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <OpenIn query="Build a React component with TypeScript">
      <OpenInTrigger />
      <OpenInContent>
        <OpenInLabel>Open in AI Chat</OpenInLabel>
        <OpenInSeparator />
        <OpenInChatGPT />
        <OpenInClaude />
        <OpenInCursor />
        <OpenInv0 />
      </OpenInContent>
    </OpenIn>
  ),
};

export const WithAllProviders: Story = {
  render: () => (
    <OpenIn query="Explain how React hooks work">
      <OpenInTrigger />
      <OpenInContent>
        <OpenInLabel>Select AI Assistant</OpenInLabel>
        <OpenInSeparator />
        <OpenInChatGPT />
        <OpenInClaude />
        <OpenInCursor />
        <OpenInv0 />
      </OpenInContent>
    </OpenIn>
  ),
};
