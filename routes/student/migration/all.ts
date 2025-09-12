import { Hono } from "hono";

export function useStudentMigrationAll(app: Hono) {
  app.get("/student/migration/all", async (c) => {
    const allMigrationPage = await Deno.readTextFile(
      "./static/student/migration/all.html",
    );
    return c.html(allMigrationPage);
  });
}
