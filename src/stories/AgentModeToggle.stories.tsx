import type { Meta, StoryObj } from "@storybook/react-vite";
import { AgentModeToggle } from "@/components/agent-mode-toggle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a mock query client for storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: "Components/AgentModeToggle",
  component: AgentModeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    onAgentChange: () => {},
  },
} satisfies Meta<typeof AgentModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedAgent: undefined,
  },
};

export const BuildMode: Story = {
  args: {
    selectedAgent: "build",
  },
};

export const PlanMode: Story = {
  args: {
    selectedAgent: "plan",
  },
};

export const WithCustomClass: Story = {
  args: {
    selectedAgent: "build",
    className: "h-12 w-12",
  },
};
