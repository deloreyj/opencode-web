import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from "@/components/ai-elements/task";

const meta = {
  title: "AI Elements/Task",
  component: Task,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Task>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Task className="w-[500px]">
      <TaskTrigger title="Searching for authentication components" />
      <TaskContent>
        <TaskItem>Found login form in <TaskItemFile>src/components/auth/LoginForm.tsx</TaskItemFile></TaskItem>
        <TaskItem>Found auth context in <TaskItemFile>src/contexts/AuthContext.tsx</TaskItemFile></TaskItem>
        <TaskItem>Found API utilities in <TaskItemFile>src/utils/api.ts</TaskItemFile></TaskItem>
      </TaskContent>
    </Task>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Task className="w-[500px]" defaultOpen={false}>
      <TaskTrigger title="Analyzing project structure" />
      <TaskContent>
        <TaskItem>Scanned 156 files</TaskItem>
        <TaskItem>Found 23 React components</TaskItem>
        <TaskItem>Identified 5 API routes</TaskItem>
      </TaskContent>
    </Task>
  ),
};

export const WithMultipleFiles: Story = {
  render: () => (
    <Task className="w-[500px]">
      <TaskTrigger title="Building user authentication flow" />
      <TaskContent>
        <TaskItem>Create login form component in <TaskItemFile>src/components/LoginForm.tsx</TaskItemFile></TaskItem>
        <TaskItem>Add validation logic to <TaskItemFile>src/utils/validation.ts</TaskItemFile></TaskItem>
        <TaskItem>Connect to API in <TaskItemFile>src/services/auth.ts</TaskItemFile></TaskItem>
        <TaskItem>Handle errors in <TaskItemFile>src/hooks/useAuth.ts</TaskItemFile></TaskItem>
      </TaskContent>
    </Task>
  ),
};
