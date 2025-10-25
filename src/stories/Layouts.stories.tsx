import type { Meta, StoryObj } from "@storybook/react-vite";
import { TwoColumnLayout, SidebarItem } from "@/components/layouts/TwoColumnLayout";
import {
	CalendarIcon,
	HomeIcon,
	InboxIcon,
	SearchIcon,
	SettingsIcon,
} from "lucide-react";

const defaultSidebarItems: SidebarItem[] = [
	{
		title: "Home",
		url: "#",
		icon: HomeIcon,
	},
	{
		title: "Inbox",
		url: "#",
		icon: InboxIcon,
	},
	{
		title: "Calendar",
		url: "#",
		icon: CalendarIcon,
	},
	{
		title: "Search",
		url: "#",
		icon: SearchIcon,
	},
	{
		title: "Settings",
		url: "#",
		icon: SettingsIcon,
	},
];

const meta = {
	title: "Layouts/TwoColumnLayout",
	component: TwoColumnLayout,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof TwoColumnLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		sidebarItems: defaultSidebarItems,
		children: (
			<div>
				<h1 className="text-2xl font-bold mb-4">Content Area</h1>
				<p className="text-muted-foreground">
					This is the main content area of the two-column layout. The sidebar is on the left,
					and this content area is on the right.
				</p>
			</div>
		),
	},
};

export const WithRichContent: Story = {
	args: {
		sidebarItems: defaultSidebarItems,
		children: (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">Welcome to your dashboard</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div className="p-6 border rounded-lg">
						<h3 className="font-semibold mb-2">Card 1</h3>
						<p className="text-sm text-muted-foreground">Some content here</p>
					</div>
					<div className="p-6 border rounded-lg">
						<h3 className="font-semibold mb-2">Card 2</h3>
						<p className="text-sm text-muted-foreground">Some content here</p>
					</div>
					<div className="p-6 border rounded-lg">
						<h3 className="font-semibold mb-2">Card 3</h3>
						<p className="text-sm text-muted-foreground">Some content here</p>
					</div>
				</div>
			</div>
		),
	},
};
