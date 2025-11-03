import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useWorkspace } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";

const formSchema = z.object({
	repoUrl: z.string().url("Must be a valid repository URL"),
	branch: z.string().min(1, "Branch name is required").default("main"),
});

type FormData = z.infer<typeof formSchema>;

export function WorkspaceCreateForm() {
	const { createWorkspace, isLoading } = useWorkspace();
	const [open, setOpen] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			repoUrl: "https://github.com/deloreyj/worker-app-boilerplate",
			branch: "main",
		},
	});

	const onSubmit = async (data: FormData) => {
		try {
			await createWorkspace(data);
			setOpen(false);
			form.reset();
		} catch (err) {
			// Error is already handled in context
			console.error("Failed to create workspace:", err);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				setOpen(newOpen);
				if (!newOpen) {
					form.reset();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					New Workspace
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<form
					id="workspace-create-form"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<DialogHeader>
						<DialogTitle>Create Workspace</DialogTitle>
						<DialogDescription>
							Clone a Git repository into a new sandboxed workspace.
							<br />
							<strong>Note:</strong> Workspace mode requires deployment to Cloudflare to work properly. In local development, use Direct Mode instead.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<FieldGroup>
							<Controller
								name="repoUrl"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="workspace-repoUrl">
											Repository URL
										</FieldLabel>
										<Input
											{...field}
											id="workspace-repoUrl"
											type="url"
											placeholder="https://github.com/username/repo"
											aria-invalid={fieldState.invalid}
											disabled={isLoading}
											autoComplete="off"
										/>
										<FieldDescription>
											Enter the full URL of the Git repository to clone.
										</FieldDescription>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="branch"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="workspace-branch">Branch</FieldLabel>
										<Input
											{...field}
											id="workspace-branch"
											type="text"
											placeholder="main"
											aria-invalid={fieldState.invalid}
											disabled={isLoading}
											autoComplete="off"
										/>
										<FieldDescription>
											The branch to checkout (default: main).
										</FieldDescription>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" form="workspace-create-form" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
