import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

const meta = {
  title: "AI Elements/Confirmation",
  component: Confirmation,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Confirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApprovalRequested: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Confirmation approval={{ id: "tool-1" }} state="approval-requested">
        <ConfirmationTitle>
          <ConfirmationRequest>
            This tool wants to delete the file{" "}
            <code className="inline rounded bg-muted px-1.5 py-0.5 text-sm">
              /tmp/example.txt
            </code>
            . Do you approve this action?
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
            <span>You approved this tool execution</span>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <XIcon className="size-4 text-destructive" />
            <span>You rejected this tool execution</span>
          </ConfirmationRejected>
        </ConfirmationTitle>
        <ConfirmationActions>
          <ConfirmationAction
            onClick={() => console.log("Rejected")}
            variant="outline"
          >
            Reject
          </ConfirmationAction>
          <ConfirmationAction
            onClick={() => console.log("Approved")}
            variant="default"
          >
            Approve
          </ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  ),
};

export const Approved: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Confirmation
        approval={{ id: "tool-2", approved: true }}
        state="approval-responded"
      >
        <ConfirmationTitle>
          <ConfirmationRequest>
            This tool wants to access your file system. Do you approve?
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
            <span>You approved this tool execution</span>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <XIcon className="size-4 text-destructive" />
            <span>You rejected this tool execution</span>
          </ConfirmationRejected>
        </ConfirmationTitle>
        <ConfirmationActions>
          <ConfirmationAction variant="outline">Reject</ConfirmationAction>
          <ConfirmationAction variant="default">Approve</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  ),
};

export const Rejected: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Confirmation
        approval={{ id: "tool-3", approved: false }}
        state="approval-responded"
      >
        <ConfirmationTitle>
          <ConfirmationRequest>
            This tool wants to send a network request. Do you approve?
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
            <span>You approved this tool execution</span>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <XIcon className="size-4 text-destructive" />
            <span>You rejected this tool execution</span>
          </ConfirmationRejected>
        </ConfirmationTitle>
        <ConfirmationActions>
          <ConfirmationAction variant="outline">Reject</ConfirmationAction>
          <ConfirmationAction variant="default">Approve</ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [state, setState] = useState<"approval-requested" | "approval-responded">("approval-requested");
    const [approved, setApproved] = useState<boolean | undefined>(undefined);

    return (
      <div className="w-full max-w-2xl">
        <Confirmation
          approval={approved !== undefined ? { id: "tool-4", approved } : { id: "tool-4" }}
          state={state}
        >
          <ConfirmationTitle>
            <ConfirmationRequest>
              This tool wants to modify system settings. Do you approve this action?
            </ConfirmationRequest>
            <ConfirmationAccepted>
              <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
              <span>You approved this tool execution</span>
            </ConfirmationAccepted>
            <ConfirmationRejected>
              <XIcon className="size-4 text-destructive" />
              <span>You rejected this tool execution</span>
            </ConfirmationRejected>
          </ConfirmationTitle>
          <ConfirmationActions>
            <ConfirmationAction
              onClick={() => {
                setApproved(false);
                setState("approval-responded");
              }}
              variant="outline"
            >
              Reject
            </ConfirmationAction>
            <ConfirmationAction
              onClick={() => {
                setApproved(true);
                setState("approval-responded");
              }}
              variant="default"
            >
              Approve
            </ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      </div>
    );
  },
};
