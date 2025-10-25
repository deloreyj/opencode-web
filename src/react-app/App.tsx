import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import type { NameResponse, ApiResponse, User } from "../types/types";

function App() {
	const [count, setCount] = useState(0);
	const [name, setName] = useState("unknown");
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleFetchName = async () => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/");
			const data = (await res.json()) as NameResponse;
			setName(data.name);
		} catch (error) {
			console.error("Failed to fetch name:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFetchUser = async () => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/user/123");
			const data = (await res.json()) as ApiResponse<User>;
			if (data.success && data.data) {
				setUser(data.data);
			}
		} catch (error) {
			console.error("Failed to fetch user:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
				<div className="fixed right-4 top-4">
					<ModeToggle />
				</div>
				<div className="mx-auto w-full max-w-2xl space-y-8">
				<div className="space-y-2 text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Vite + React + Hono + Cloudflare
					</h1>
					<p className="text-muted-foreground">
						Full-stack application with shadcn/ui
					</p>
				</div>

				<div className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold">Counter Example</h2>
						<p className="text-sm text-muted-foreground">
							Click the button to increment the counter
						</p>
						<Button
							onClick={() => setCount((count) => count + 1)}
							aria-label="increment"
							size="lg"
							className="w-full"
						>
							Count is {count}
						</Button>
					</div>
				</div>

				<div className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold">API Integration</h2>
						<p className="text-sm text-muted-foreground">
							Fetch data from the Hono backend running on Cloudflare Workers
						</p>
						<div className="flex flex-col gap-2">
							<Button
								onClick={handleFetchName}
								aria-label="get name"
								variant="outline"
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : `Name from API: ${name}`}
							</Button>
							<Button
								onClick={handleFetchUser}
								aria-label="get user"
								variant="outline"
								disabled={isLoading}
							>
								{isLoading ? "Loading..." : "Fetch User"}
							</Button>
							{user && (
								<div className="rounded bg-muted p-3 text-sm">
									<p><strong>ID:</strong> {user.id}</p>
									<p><strong>Name:</strong> {user.name}</p>
									<p><strong>Email:</strong> {user.email}</p>
									<p className="text-xs text-muted-foreground mt-1">
										Created: {new Date(user.createdAt).toLocaleString()}
									</p>
								</div>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							Edit <code className="rounded bg-muted px-1 py-0.5">src/worker/index.ts</code> to change the API response
						</p>
					</div>
				</div>

				<div className="grid gap-4 rounded-lg border bg-card p-6 shadow-sm">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold">Quick Links</h2>
						<div className="flex flex-wrap gap-2">
							<Button variant="secondary" size="sm" asChild>
								<a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
									Vite Docs
								</a>
							</Button>
							<Button variant="secondary" size="sm" asChild>
								<a href="https://react.dev" target="_blank" rel="noopener noreferrer">
									React Docs
								</a>
							</Button>
							<Button variant="secondary" size="sm" asChild>
								<a href="https://hono.dev" target="_blank" rel="noopener noreferrer">
									Hono Docs
								</a>
							</Button>
							<Button variant="secondary" size="sm" asChild>
								<a href="https://workers.cloudflare.com" target="_blank" rel="noopener noreferrer">
									Cloudflare Workers
								</a>
							</Button>
							<Button variant="secondary" size="sm" asChild>
								<a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
									shadcn/ui
								</a>
							</Button>
						</div>
					</div>
				</div>
				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
