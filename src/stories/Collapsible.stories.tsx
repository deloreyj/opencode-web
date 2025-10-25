import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: function Render() {
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(true);

    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-medium mb-4">Closed by Default</p>
          <Collapsible
            open={isOpen1}
            onOpenChange={setIsOpen1}
            className="flex w-[350px] flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-4 px-4">
              <h4 className="text-sm font-semibold">Collapsible Content</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronsUpDown />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="rounded-md border px-4 py-2 font-mono text-sm">
              Always visible
            </div>
            <CollapsibleContent className="flex flex-col gap-2">
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                Hidden content 1
              </div>
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                Hidden content 2
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div>
          <p className="text-sm font-medium mb-4">Open by Default</p>
          <Collapsible
            open={isOpen2}
            onOpenChange={setIsOpen2}
            className="flex w-[350px] flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-4 px-4">
              <h4 className="text-sm font-semibold">Expanded Collapsible</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronsUpDown />
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="rounded-md border px-4 py-2 font-mono text-sm">
              Always visible
            </div>
            <CollapsibleContent className="flex flex-col gap-2">
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                Expanded content 1
              </div>
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                Expanded content 2
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    );
  },
};

export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex w-[350px] flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-4 px-4">
          <h4 className="text-sm font-semibold">
            @peduarte starred 3 repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="flex flex-col gap-2">
          <div className="rounded-md border px-4 py-2 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-2 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const DefaultOpen: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex w-[350px] flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-4 px-4">
          <h4 className="text-sm font-semibold">
            Starred repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="flex flex-col gap-2">
          <div className="rounded-md border px-4 py-2 font-mono text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-2 font-mono text-sm">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};
