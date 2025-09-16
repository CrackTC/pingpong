import { Hono } from "hono";

export function useLanding(app: Hono) {
  app.get("/", async (c) => {
    const page = await Deno.readTextFile("./static/index.html");
    return c.html(page);
  });
}
