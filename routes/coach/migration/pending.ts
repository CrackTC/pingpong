import { Hono } from "hono";

export function useCoachMigrationPending(app: Hono) {
  app.get("/coach/migration/pending", async (c) => {
    const pendingMigrationsPage = await Deno.readTextFile(
      "./static/coach/migration/pending.html",
    );
    return c.html(pendingMigrationsPage);
  });
}
