import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="text-sm">With Image</span>
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://invalid-url.example.com" alt="Invalid" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <span className="text-sm">Fallback Only</span>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="rounded-lg">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="text-sm">Rounded</span>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="Small" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="Medium" />
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="Large" />
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
        <span className="text-sm">Sizes</span>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://invalid-url.example.com" alt="Invalid" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Rounded: Story = {
  render: () => (
    <Avatar className="rounded-lg">
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="@shadcn"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://github.com/vercel.png"
          alt="@vercel"
        />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://github.com/nextjs.png"
          alt="@nextjs"
        />
        <AvatarFallback>NJ</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-row flex-wrap items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/shadcn.png" alt="Small" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Medium" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage src="https://github.com/shadcn.png" alt="Large" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
