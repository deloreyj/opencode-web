import { ThemeProvider } from "@/components/theme-provider";
import { ChatPage } from "./pages/ChatPage";

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="opencode-ui-theme">
			<div className="relative h-screen w-full overflow-hidden bg-background">
				<ChatPage />
			</div>
		</ThemeProvider>
	);
}

export default App;
