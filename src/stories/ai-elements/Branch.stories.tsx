import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
} from "@/components/ai-elements/branch";
import { Message, MessageContent, MessageAvatar } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";

const meta = {
  title: "AI Elements/Branch",
  component: Branch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Branch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <Branch defaultBranch={0}>
        <BranchMessages>
          <Message from="assistant">
            <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
            <MessageContent>
              <Response>
                React hooks are functions that let you use state and other React features in function components. This is version 1 of the response.
              </Response>
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
            <MessageContent>
              <Response>
                Hooks revolutionized React development by allowing functional components to have state and lifecycle features. This is version 2 of the response.
              </Response>
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
            <MessageContent>
              <Response>
                In React, hooks are special functions that let you "hook into" React features from function components. This is version 3 of the response.
              </Response>
            </MessageContent>
          </Message>
        </BranchMessages>
        <BranchSelector from="assistant">
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      </Branch>
    </div>
  ),
};

export const TwoBranches: Story = {
  render: () => (
    <div className="w-[600px]">
      <Branch defaultBranch={0}>
        <BranchMessages>
          <Message from="assistant">
            <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
            <MessageContent>
              <Response>This is the first version of the response.</Response>
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageAvatar src="https://github.com/vercel.png" name="Assistant" />
            <MessageContent>
              <Response>This is an alternative second version.</Response>
            </MessageContent>
          </Message>
        </BranchMessages>
        <BranchSelector from="assistant">
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      </Branch>
    </div>
  ),
};

export const UserBranch: Story = {
  render: () => (
    <div className="w-[600px]">
      <Branch defaultBranch={0}>
        <BranchMessages>
          <Message from="user">
            <MessageContent>
              <Response>Can you explain React hooks?</Response>
            </MessageContent>
            <MessageAvatar src="https://github.com/shadcn.png" name="User" />
          </Message>
          <Message from="user">
            <MessageContent>
              <Response>What are React hooks and how do they work?</Response>
            </MessageContent>
            <MessageAvatar src="https://github.com/shadcn.png" name="User" />
          </Message>
          <Message from="user">
            <MessageContent>
              <Response>Tell me about hooks in React</Response>
            </MessageContent>
            <MessageAvatar src="https://github.com/shadcn.png" name="User" />
          </Message>
        </BranchMessages>
        <BranchSelector from="user">
          <BranchPrevious />
          <BranchPage />
          <BranchNext />
        </BranchSelector>
      </Branch>
    </div>
  ),
};
