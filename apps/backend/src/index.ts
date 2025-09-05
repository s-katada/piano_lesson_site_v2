import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
  { id: 3, name: "John Smith" },
  { id: 4, name: "Jane Smith" },
];

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.get("/api/users", (c) => {
  return c.json(users, 200);
});

export default app;
