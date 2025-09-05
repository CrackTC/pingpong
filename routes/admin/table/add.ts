import { Hono } from "hono";

export function useAdminTableAdd(app: Hono) {
  app.get("/admin/table/add", async (c) => {
    const addTablePage = await Deno.readTextFile(
      "./static/admin/table/add.html",
    );
    return c.html(addTablePage);
  });
}
