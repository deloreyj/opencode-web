import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";

const meta = {
  title: "AI Elements/Suggestion",
  component: Suggestions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[800px]">
      <Suggestions>
        <Suggestion
          suggestion="What are the latest trends in AI?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="How does machine learning work?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="Explain quantum computing"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="Best practices for React development"
          onClick={() => console.log("Clicked")}
        />
      </Suggestions>
    </div>
  ),
};

export const ManySuggestions: Story = {
  render: () => (
    <div className="w-[800px]">
      <Suggestions>
        <Suggestion
          suggestion="What are the latest trends in AI?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="How does machine learning work?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="Explain quantum computing"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="Best practices for React development"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="Tell me about TypeScript benefits"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="How to optimize database queries?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="What is the difference between SQL and NoSQL?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="Explain cloud computing basics"
          onClick={() => console.log("Clicked")}
        />
      </Suggestions>
    </div>
  ),
};

export const LongSuggestions: Story = {
  render: () => (
    <div className="w-[800px]">
      <Suggestions>
        <Suggestion
          suggestion="Can you help me understand the differences between server-side rendering and client-side rendering in modern web applications?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="What are the best practices for implementing authentication and authorization in a microservices architecture?"
          onClick={() => console.log("Clicked")}
        />
        <Suggestion
          suggestion="How do I optimize the performance of a React application with large lists and complex state management?"
          onClick={() => console.log("Clicked")}
        />
      </Suggestions>
    </div>
  ),
};
