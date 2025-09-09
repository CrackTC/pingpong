import { Hono } from "hono";

export function useAdminStudentSearch(app: Hono) {
  app.get("/admin/student/search", async (c) => {
    const searchPage = await Deno.readTextFile(
      "./static/admin/student/search.html",
    );
    return c.html(searchPage);
  });
}
