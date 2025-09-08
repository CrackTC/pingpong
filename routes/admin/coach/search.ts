import { Hono } from "hono";

export function useAdminCoachSearch(app: Hono) {
  app.get("/admin/coach/search", async (c) => {
    const searchPage = await Deno.readTextFile(
      "./static/admin/coach/search.html",
    );
    return c.html(searchPage);
  });
}
