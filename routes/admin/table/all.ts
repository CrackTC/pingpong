import { Hono } from "hono";

export function useAdminTableAll(app: Hono) {
  app.get("/admin/table/all", async (c) => {
    const allTablesPage = await Deno.readTextFile(
      "./static/admin/table/all.html",
    );
    return c.html(allTablesPage);
  });
}
