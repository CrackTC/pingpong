import { Hono } from "hono";

export function useAdminSystemLogs(app: Hono) {
  app.get("/admin/system-logs", async (c) => {
    const systemLogsPage = await Deno.readTextFile(
      "./static/admin/system-logs.html",
    );
    return c.html(systemLogsPage);
  });
}
