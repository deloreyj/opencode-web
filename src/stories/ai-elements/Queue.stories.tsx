import type { Meta, StoryObj } from "@storybook/react-vite";
import { Queue, QueueItem } from "@/components/ai-elements/queue";

const meta = {
  title: "AI Elements/Queue",
  component: Queue,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Queue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Queue className="w-[400px]">
      <QueueItem status="completed">Process user input</QueueItem>
      <QueueItem status="in-progress">Analyze context</QueueItem>
      <QueueItem status="pending">Generate response</QueueItem>
      <QueueItem status="pending">Format output</QueueItem>
    </Queue>
  ),
};

export const SingleItem: Story = {
  render: () => (
    <Queue className="w-[400px]">
      <QueueItem status="in-progress">Processing...</QueueItem>
    </Queue>
  ),
};
