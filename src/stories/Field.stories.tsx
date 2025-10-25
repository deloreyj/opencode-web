import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-md">
      <Field>
        <FieldLabel htmlFor="name-1">Simple Field</FieldLabel>
        <Input id="name-1" placeholder="Enter your name" />
      </Field>
      <Field>
        <FieldLabel htmlFor="email-1">Field with Description</FieldLabel>
        <Input id="email-1" type="email" placeholder="email@example.com" />
        <FieldDescription>We'll never share your email.</FieldDescription>
      </Field>
      <FieldSet>
        <FieldLegend>FieldSet with Multiple Fields</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="first">First Name</FieldLabel>
            <Input id="first" placeholder="John" />
          </Field>
          <Field>
            <FieldLabel htmlFor="last">Last Name</FieldLabel>
            <Input id="last" placeholder="Doe" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" placeholder="Enter your name" />
      </Field>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Field>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input id="username" placeholder="shadcn" />
        <FieldDescription>
          This is your public display name.
        </FieldDescription>
      </Field>
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Field>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself"
          className="resize-none"
        />
        <FieldDescription>
          Write a brief description about yourself.
        </FieldDescription>
      </Field>
    </div>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Field orientation="horizontal">
        <Checkbox id="terms" />
        <FieldLabel htmlFor="terms" className="font-normal">
          Accept terms and conditions
        </FieldLabel>
      </Field>
    </div>
  ),
};

export const FieldGroupExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="user@example.com" />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" placeholder="••••••••" />
        </Field>
      </FieldGroup>
    </div>
  ),
};

export const FieldSetExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
                <Input id="card-name" placeholder="Evil Rabbit" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="exp-month">Month</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="exp-month">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01</SelectItem>
                      <SelectItem value="02">02</SelectItem>
                      <SelectItem value="03">03</SelectItem>
                      <SelectItem value="06">06</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="exp-year">Year</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="exp-year">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                  <Input id="cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="same-as-shipping" defaultChecked />
                <FieldLabel htmlFor="same-as-shipping" className="font-normal">
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  ),
};
