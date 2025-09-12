import { Hono } from "hono";

export function useAdminMigrations(app: Hono) {
  app.get("/admin/migrations", async (c) => {
    const migrationsPage = await Deno.readTextFile(
      "./static/admin/migrations.html",
    );
    return c.html(migrationsPage);
  });
}
