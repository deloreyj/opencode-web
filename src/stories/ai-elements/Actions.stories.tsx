import type { Meta, StoryObj } from "@storybook/react-vite";
import { Actions, Action } from "@/components/ai-elements/actions";
import { CopyIcon, RefreshCcwIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon } from "lucide-react";

const meta = {
  title: "AI Elements/Actions",
  component: Actions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Actions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Actions>
      <Action onClick={() => console.log("Copy")} label="Copy">
        <CopyIcon className="size-3" />
      </Action>
      <Action onClick={() => console.log("Retry")} label="Retry">
        <RefreshCcwIcon className="size-3" />
      </Action>
    </Actions>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <Actions>
      <Action onClick={() => console.log("Copy")} label="Copy">
        <CopyIcon className="size-3" />
      </Action>
      <Action onClick={() => console.log("Retry")} label="Retry">
        <RefreshCcwIcon className="size-3" />
      </Action>
      <Action onClick={() => console.log("Like")} label="Like">
        <ThumbsUpIcon className="size-3" />
      </Action>
      <Action onClick={() => console.log("Dislike")} label="Dislike">
        <ThumbsDownIcon className="size-3" />
      </Action>
      <Action onClick={() => console.log("Share")} label="Share">
        <ShareIcon className="size-3" />
      </Action>
    </Actions>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Actions>
      <Action onClick={() => console.log("Copy")} label="Copy" disabled>
        <CopyIcon className="size-3" />
      </Action>
      <Action onClick={() => console.log("Retry")} label="Retry" disabled>
        <RefreshCcwIcon className="size-3" />
      </Action>
    </Actions>
  ),
};
