import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { ChatPage } from "./pages/ChatPage";

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="opencode-ui-theme">
			<div className="relative h-screen w-full overflow-hidden bg-background">
				<div className="fixed right-4 top-4 z-50">
					<ModeToggle />
				</div>
				<ChatPage />
			</div>
		</ThemeProvider>
	);
}

export default App;
