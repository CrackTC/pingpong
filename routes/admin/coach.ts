import { Hono } from "hono";

export function useAdminCoaches(app: Hono) {
  app.get("/admin/coach/pending", (c) => {
    return c.html(Deno.readTextFileSync("static/admin/coach/pending.html"));
  });
}
