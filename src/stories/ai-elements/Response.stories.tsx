import type { Meta, StoryObj } from "@storybook/react-vite";
import { Response } from "@/components/ai-elements/response";

const meta = {
  title: "AI Elements/Response",
  component: Response,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Response>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlainText: Story = {
  args: {
    children: "This is a simple text response from the AI assistant.",
  },
};

export const WithMarkdown: Story = {
  args: {
    children: `# Heading

This is a paragraph with **bold** and *italic* text.

## Subheading

- List item 1
- List item 2
- List item 3

### Code Example

Here's some inline \`code\` and a block:

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\``,
  },
};

export const WithCodeBlocks: Story = {
  args: {
    children: `Here's how to use React hooks:

\`\`\`typescript
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

This example demonstrates useState and useEffect hooks.`,
  },
};

export const WithLinks: Story = {
  args: {
    children: `You can learn more about React at [react.dev](https://react.dev).

Check out these resources:
- [React Documentation](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)`,
  },
};

export const LongResponse: Story = {
  args: {
    children: `# Complete Guide to React Hooks

React Hooks are a fundamental feature introduced in React 16.8 that allow you to use state and other React features without writing a class component.

## useState Hook

The \`useState\` hook lets you add state to function components:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect Hook

The \`useEffect\` hook lets you perform side effects in function components:

\`\`\`javascript
useEffect(() => {
  // Side effect code here
  return () => {
    // Cleanup code here
  };
}, [dependencies]);
\`\`\`

## useContext Hook

The \`useContext\` hook lets you consume context values:

\`\`\`javascript
const theme = useContext(ThemeContext);
\`\`\`

## Custom Hooks

You can create your own hooks to reuse stateful logic:

\`\`\`javascript
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
\`\`\`

## Best Practices

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call hooks from React function components or custom hooks
3. **Use the ESLint plugin** - The \`eslint-plugin-react-hooks\` helps enforce these rules

For more information, visit the [official React documentation](https://react.dev/reference/react).`,
  },
};
