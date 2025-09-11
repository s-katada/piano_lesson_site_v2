import { contactRoutes } from "./routes/contact";
import type { Bindings } from "./types/bindings";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Bindings }>()
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: (_origin, c) => c.env.CLIENT_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )
  .onError((err, c) => {
    return c.json(
      {
        message: "Internal Server Error",
        error: err.message,
      },
      500
    );
  })
  .get("/", (c) => {
    return c.json({
      message: "Piano Lesson Site API",
      version: "1.0.0",
      endpoints: {
        contact: "/api/contact",
      },
    });
  })
  .route("/api/contact", contactRoutes);

export default app;
export type AppType = typeof app;
