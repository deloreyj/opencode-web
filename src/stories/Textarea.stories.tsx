import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="grid w-full gap-1.5">
        <Label>Default</Label>
        <Textarea placeholder="Type your message here." />
      </div>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="with-label">With label and helper text</Label>
        <Textarea placeholder="Type your message here." id="with-label" />
        <p className="text-muted-foreground text-sm">
          Your message will be copied to the support team.
        </p>
      </div>
      <div className="grid w-full gap-1.5">
        <Label>With value</Label>
        <Textarea defaultValue="This is a default value in the textarea." />
      </div>
      <div className="grid w-full gap-1.5">
        <Label>Disabled</Label>
        <Textarea placeholder="Type your message here." disabled />
      </div>
    </div>
  ),
};

export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-2">Your message</Label>
      <Textarea placeholder="Type your message here." id="message-2" />
      <p className="text-muted-foreground text-sm">
        Your message will be copied to the support team.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Type your message here.",
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "This is a default value in the textarea.",
  },
};
