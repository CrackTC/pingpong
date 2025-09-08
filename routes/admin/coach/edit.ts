import { Hono } from "hono";

export function useAdminCoachEdit(app: Hono) {
  app.get("/admin/coach/edit/:id", async (c) => {
    const editPage = await Deno.readTextFile(
      "./static/admin/coach/edit.html",
    );
    return c.html(editPage);
  });
}
