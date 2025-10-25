import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: function Render() {
    const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
    const [multipleDates, setMultipleDates] = useState<Date[] | undefined>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-medium mb-2">Single Selection</p>
          <Calendar
            mode="single"
            selected={singleDate}
            onSelect={setSingleDate}
            className="rounded-md border"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Multiple Selection</p>
          <Calendar
            mode="multiple"
            selected={multipleDates}
            onSelect={setMultipleDates}
            className="rounded-md border"
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Range Selection</p>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            className="rounded-md border"
          />
        </div>
      </div>
    );
  },
};

export const Default: Story = {
  render: function Render() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-sm"
        captionLayout="dropdown"
      />
    );
  },
};

export const Simple: Story = {
  render: function Render() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const Multiple: Story = {
  render: function Render() {
    const [dates, setDates] = useState<Date[] | undefined>([]);

    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    );
  },
};

export const Range: Story = {
  render: function Render() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    return (
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={setDateRange}
        className="rounded-md border"
        numberOfMonths={2}
      />
    );
  },
};
