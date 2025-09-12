import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getNotificationsForAdmin } from "../../../data/notificationDao.ts";
import { getAdminById } from "../../../data/adminDao.ts";

export function useApiAdminNotifications(app: Hono) {
  app.get("/api/admin/notifications", async (c) => {
    const claim = await getClaim(c);

    try {
      let notifications;
      if (claim.type === "root") {
        notifications = getNotificationsForAdmin();
      } else if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }
        notifications = getNotificationsForAdmin(admin.campus);
      } else {
        return c.json({ message: "Unauthorized access." }, 403);
      }
      return c.json(notifications);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
