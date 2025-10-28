import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shimmer } from "@/components/ai-elements/shimmer";

const meta = {
  title: "AI Elements/Shimmer",
  component: Shimmer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Shimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Loading content...",
  },
};

export const ShortText: Story = {
  args: {
    children: "AI is thinking",
    duration: 1.5,
  },
};

export const LongText: Story = {
  args: {
    children: "Analyzing your request and generating a comprehensive response",
    className: "text-lg",
    duration: 3,
  },
};

export const AsHeading: Story = {
  args: {
    children: "Processing Request",
    as: "h2",
    className: "text-2xl font-bold",
  },
};

export const FastAnimation: Story = {
  args: {
    children: "Quick shimmer effect",
    duration: 1,
    spread: 1,
  },
};
