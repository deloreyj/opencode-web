import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search, Mail, Lock } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

const meta = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Mail />
        </InputGroupAddon>
        <InputGroupInput placeholder="email@example.com" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Lock />
        </InputGroupAddon>
        <InputGroupInput type="password" placeholder="Password" />
      </InputGroup>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <InputGroup className="w-full max-w-sm">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <InputGroup className="w-full max-w-sm">
      <InputGroupInput placeholder="example.com" />
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Email" type="email" />
        <InputGroupAddon>
          <Mail className="h-4 w-4" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Password" type="password" />
        <InputGroupAddon>
          <Lock className="h-4 w-4" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithEndAddon: Story = {
  render: () => (
    <InputGroup className="w-full max-w-sm">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon align="inline-end">
        <Search className="h-4 w-4" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>12 results</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const EmailInput: Story = {
  render: () => (
    <InputGroup className="w-full max-w-sm">
      <InputGroupInput placeholder="username" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@example.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const PriceInput: Story = {
  render: () => (
    <InputGroup className="w-full max-w-sm">
      <InputGroupInput placeholder="0.00" type="number" />
      <InputGroupAddon>
        <InputGroupText>$</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};
