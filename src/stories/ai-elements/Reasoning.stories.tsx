import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";

const meta = {
  title: "AI Elements/Reasoning",
  component: Reasoning,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <Reasoning duration={5}>
        <ReasoningTrigger />
        <ReasoningContent>
          The user is asking about React hooks. I should explain what they are, provide examples of the most common hooks like useState and useEffect, and mention best practices.
        </ReasoningContent>
      </Reasoning>
    </div>
  ),
};

export const LongReasoning: Story = {
  render: () => (
    <div className="w-[600px]">
      <Reasoning duration={12}>
        <ReasoningTrigger />
        <ReasoningContent>
          The user is asking for a detailed explanation of React hooks and their use cases. I need to:

          1. Explain what hooks are and why they were introduced
          2. Cover the most common hooks: useState, useEffect, useContext, useReducer
          3. Provide practical code examples for each
          4. Mention the rules of hooks
          5. Discuss custom hooks and when to create them
          6. Include best practices and common pitfalls

          I should structure the response with clear headings and code blocks to make it easy to follow.
        </ReasoningContent>
      </Reasoning>
    </div>
  ),
};

export const Streaming: Story = {
  render: () => (
    <div className="w-[600px]">
      <Reasoning isStreaming duration={3}>
        <ReasoningTrigger />
        <ReasoningContent>
          Analyzing the question about React hooks. Considering the best way to explain...
        </ReasoningContent>
      </Reasoning>
    </div>
  ),
};

export const WithoutDuration: Story = {
  render: () => (
    <div className="w-[600px]">
      <Reasoning>
        <ReasoningTrigger />
        <ReasoningContent>
          This reasoning component doesn't display a duration timer.
        </ReasoningContent>
      </Reasoning>
    </div>
  ),
};
