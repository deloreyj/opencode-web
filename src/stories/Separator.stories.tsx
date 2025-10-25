import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@/components/ui/separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Horizontal separator:</p>
        <div className="w-full max-w-sm">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Section 1</h4>
            <p className="text-sm text-muted-foreground">Content for section 1</p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Section 2</h4>
            <p className="text-sm text-muted-foreground">Content for section 2</p>
          </div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Vertical separator:</p>
        <div className="flex h-20 items-center space-x-4">
          <div className="text-sm">Item 1</div>
          <Separator orientation="vertical" />
          <div className="text-sm">Item 2</div>
          <Separator orientation="vertical" />
          <div className="text-sm">Item 3</div>
        </div>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Section 1</h4>
        <p className="text-sm text-muted-foreground">Content for section 1</p>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Section 2</h4>
        <p className="text-sm text-muted-foreground">Content for section 2</p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center space-x-4">
      <div className="text-sm">Item 1</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Item 2</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Item 3</div>
    </div>
  ),
};
