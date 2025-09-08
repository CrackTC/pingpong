import { Hono } from "hono";

export function useAdminCoachAdd(app: Hono) {
  app.get("/admin/coach/add", async (c) => {
    const addPage = await Deno.readTextFile(
      "./static/admin/coach/add.html",
    );
    return c.html(addPage);
  });
}
