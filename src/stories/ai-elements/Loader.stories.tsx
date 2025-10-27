import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader } from "@/components/ai-elements/loader";

const meta = {
  title: "AI Elements/Loader",
  component: Loader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InConversation: Story = {
  render: () => (
    <div className="w-[600px] p-4 border rounded-lg">
      <div className="mb-4 text-sm text-muted-foreground">
        Waiting for response...
      </div>
      <Loader />
    </div>
  ),
};
