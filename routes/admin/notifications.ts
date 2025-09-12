import { Hono } from "hono";

export function useAdminNotifications(app: Hono) {
  app.get("/admin/notifications", async (c) => {
    const notificationsPage = await Deno.readTextFile(
      "./static/admin/notifications.html",
    );
    return c.html(notificationsPage);
  });
}
