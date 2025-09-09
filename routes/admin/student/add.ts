import { Hono } from "hono";

export function useAdminStudentAdd(app: Hono) {
  app.get("/admin/student/add", async (c) => {
    const addPage = await Deno.readTextFile(
      "./static/admin/student/add.html",
    );
    return c.html(addPage);
  });
}
