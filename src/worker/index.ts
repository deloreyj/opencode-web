import { Hono } from "hono";
import type { ApiResponse, NameResponse, User } from "../types/types";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => {
	const response: NameResponse = { name: "Cloudflare" };
	return c.json(response);
});

app.get("/api/user/:id", (c) => {
	const id = c.req.param("id");
	const user: User = {
		id,
		name: "John Doe",
		email: "john@example.com",
		createdAt: new Date().toISOString(),
	};
	const response: ApiResponse<User> = {
		success: true,
		data: user,
	};
	return c.json(response);
});

export default app;
