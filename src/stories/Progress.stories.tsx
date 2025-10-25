import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-md">
      <div>
        <p className="text-sm font-medium mb-2">0% Progress</p>
        <Progress value={0} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">33% Progress</p>
        <Progress value={33} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">66% Progress</p>
        <Progress value={66} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">100% Progress</p>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: function Render() {
    const [progress, setProgress] = useState(13);

    useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);

    return <Progress value={progress} className="w-[60%]" />;
  },
};

export const Zero: Story = {
  args: {
    value: 0,
    className: "w-[60%]",
  },
};

export const Half: Story = {
  args: {
    value: 50,
    className: "w-[60%]",
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    className: "w-[60%]",
  },
};

export const Animated: Story = {
  render: function Render() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(timer);
    }, []);

    return <Progress value={progress} className="w-[60%]" />;
  },
};
