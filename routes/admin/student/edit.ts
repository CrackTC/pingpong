import { Hono } from "hono";

export function useAdminStudentEdit(app: Hono) {
  app.get("/admin/student/edit", async (c) => {
    const editPage = await Deno.readTextFile(
      "./static/admin/student/edit.html",
    );
    return c.html(editPage);
  });
}
