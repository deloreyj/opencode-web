import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Spinner className="size-4" />
        <span className="text-sm">Small</span>
      </div>
      <div className="flex items-center gap-4">
        <Spinner />
        <span className="text-sm">Default</span>
      </div>
      <div className="flex items-center gap-4">
        <Spinner className="size-8" />
        <span className="text-sm">Large</span>
      </div>
      <div className="flex items-center gap-4">
        <Button disabled>
          <Spinner />
          Loading...
        </Button>
        <span className="text-sm">In Button</span>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => <Spinner />,
};

export const Small: Story = {
  render: () => <Spinner className="size-4" />,
};

export const Large: Story = {
  render: () => <Spinner className="size-8" />,
};

export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner />
      Loading...
    </Button>
  ),
};

export const Standalone: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner />
      <span className="text-sm text-muted-foreground">Loading content...</span>
    </div>
  ),
};
