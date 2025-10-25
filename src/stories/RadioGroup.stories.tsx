import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium mb-4">Default</p>
        <RadioGroup defaultValue="option-two">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option-one" id="v1" />
            <Label htmlFor="v1">Option One</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option-two" id="v2" />
            <Label htmlFor="v2">Option Two (Selected)</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="option-three" id="v3" />
            <Label htmlFor="v3">Option Three</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <p className="text-sm font-medium mb-4">With Disabled Option</p>
        <RadioGroup defaultValue="enabled">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="enabled" id="v4" />
            <Label htmlFor="v4">Enabled</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="disabled" id="v5" disabled />
            <Label htmlFor="v5">Disabled</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="option-2" id="option-2" disabled />
        <Label htmlFor="option-2">Option 2 (Disabled)</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};
