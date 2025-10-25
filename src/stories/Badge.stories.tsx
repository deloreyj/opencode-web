import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, BadgeCheck, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Badge</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="secondary"
        className="bg-blue-500 text-white dark:bg-blue-600"
      >
        <BadgeCheck />
        Verified
      </Badge>
      <Badge variant="destructive">
        <AlertCircle />
        Error
      </Badge>
      <Badge>
        <Check />
        Success
      </Badge>
    </div>
  ),
};

export const Notification: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
        8
      </Badge>
      <Badge
        className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
        variant="destructive"
      >
        99
      </Badge>
      <Badge
        className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
        variant="outline"
      >
        20+
      </Badge>
    </div>
  ),
};
