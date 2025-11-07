/**
 * API Key Settings Component
 * Allows users to input and save their OpenCode API key
 */

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyIcon, CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react";
import { useOpencodeClient } from "@/hooks/use-opencode-client";
import { opencodeKeys } from "@/hooks/use-opencode";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function ApiKeySettings() {
	const [apiKey, setApiKey] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const client = useOpencodeClient();
	const queryClient = useQueryClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!apiKey.trim()) {
			setStatus("error");
			setErrorMessage("API key is required");
			return;
		}

		setIsLoading(true);
		setStatus("idle");
		setErrorMessage("");

		try {
			const { error } = await client.auth.set({
				path: { id: "opencode" },
				body: {
					type: "api",
					key: apiKey.trim(),
				},
			});

			if (error) {
				setStatus("error");
				setErrorMessage(typeof error === "string" ? error : "Failed to save API key");
			} else {
				setStatus("success");
				setApiKey(""); // Clear input on success
				setTimeout(() => setStatus("idle"), 3000);

				// Invalidate providers query to refresh available models
				await queryClient.invalidateQueries({ queryKey: opencodeKeys.providers() });
				await queryClient.invalidateQueries({ queryKey: opencodeKeys.config() });
			}
		} catch (err) {
			setStatus("error");
			setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<KeyIcon className="size-5" />
					OpenCode API Key
				</CardTitle>
				<CardDescription>
					Enter your OpenCode API key to authenticate with the sandbox environment
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="api-key">API Key</Label>
						<Input
							id="api-key"
							type="password"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							disabled={isLoading}
							className="font-mono"
						/>
					</div>

					{status === "success" && (
						<div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-green-600 text-sm">
							<CheckCircleIcon className="size-4" />
							<span>API key saved successfully</span>
						</div>
					)}

					{status === "error" && (
						<div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-red-600 text-sm">
							<XCircleIcon className="size-4" />
							<span>{errorMessage || "Failed to save API key"}</span>
						</div>
					)}

					<Button type="submit" disabled={isLoading || !apiKey.trim()}>
						{isLoading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
						Save API Key
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
