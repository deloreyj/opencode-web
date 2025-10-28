import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanContent,
  PlanTrigger,
  PlanAction,
  PlanFooter,
} from "@/components/ai-elements/plan";
import { Button } from "@/components/ui/button";

const meta = {
  title: "AI Elements/Plan",
  component: Plan,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Plan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Plan className="w-[600px]" defaultOpen>
      <PlanHeader>
        <div>
          <PlanTitle>Implementation Plan</PlanTitle>
          <PlanDescription>Steps to complete the feature</PlanDescription>
        </div>
        <PlanAction>
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Set up project structure
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">→</span> Implement core functionality
          </li>
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">○</span> Write tests
          </li>
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">○</span> Deploy to production
          </li>
        </ul>
      </PlanContent>
      <PlanFooter>
        <Button size="sm" variant="outline">View Details</Button>
      </PlanFooter>
    </Plan>
  ),
};

export const Streaming: Story = {
  render: () => (
    <Plan className="w-[600px]" defaultOpen isStreaming>
      <PlanHeader>
        <div>
          <PlanTitle>Generating Plan</PlanTitle>
          <PlanDescription>Analyzing requirements and creating steps</PlanDescription>
        </div>
        <PlanAction>
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <p className="text-sm text-muted-foreground">Planning in progress...</p>
      </PlanContent>
    </Plan>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Plan className="w-[600px]" defaultOpen={false}>
      <PlanHeader>
        <div>
          <PlanTitle>Quick Tasks</PlanTitle>
          <PlanDescription>2 tasks remaining</PlanDescription>
        </div>
        <PlanAction>
          <PlanTrigger />
        </PlanAction>
      </PlanHeader>
      <PlanContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Research options
          </li>
          <li className="flex items-center gap-2">
            <span className="text-muted-foreground">○</span> Make decision
          </li>
        </ul>
      </PlanContent>
    </Plan>
  ),
};
