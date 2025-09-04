import { Hono } from "hono";

export function useAdminHome(app: Hono) {
  app.get("/admin/home", (c) => {
    return c.html(Deno.readTextFileSync("static/admin/home.html"));
  });
}
