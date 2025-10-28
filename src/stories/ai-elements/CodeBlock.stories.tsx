import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@/components/ai-elements/code-block";

const meta = {
  title: "AI Elements/CodeBlock",
  component: CodeBlock,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCode = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`;

export const Default: Story = {
  args: {
    code: sampleCode,
    language: "typescript",
  },
};

export const JavaScript: Story = {
  args: {
    code: `const greeting = "Hello, World!";
console.log(greeting);`,
    language: "javascript",
  },
};

export const Python: Story = {
  args: {
    code: `def hello_world():
    print("Hello, World!")

hello_world()`,
    language: "python",
  },
};
