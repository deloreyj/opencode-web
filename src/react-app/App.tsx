import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { ChatPage } from "./pages/ChatPage";

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="opencode-ui-theme">
			<WorkspaceProvider>
				<div className="relative h-screen w-full overflow-hidden bg-background">
					<ChatPage />
				</div>
			</WorkspaceProvider>
		</ThemeProvider>
	);
}

export default App;
