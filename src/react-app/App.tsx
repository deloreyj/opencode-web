import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { ChatPage } from "./pages/ChatPage";
import { RpcTestPage } from "./pages/RpcTestPage";

function App() {
	// Simple route switcher - check URL hash
	const isRpcTest = window.location.hash === "#rpc-test";
	
	return (
		<ThemeProvider defaultTheme="dark" storageKey="opencode-ui-theme">
			<WorkspaceProvider>
				<div className="relative h-screen w-full overflow-hidden bg-background">
					{isRpcTest ? <RpcTestPage /> : <ChatPage />}
				</div>
			</WorkspaceProvider>
		</ThemeProvider>
	);
}

export default App;
