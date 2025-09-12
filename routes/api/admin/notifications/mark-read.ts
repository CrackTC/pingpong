import { Hono } from "hono";
import {
  getNotificationById,
  markNotificationAsRead,
} from "../../../../data/notificationDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminNotificationsMarkRead(app: Hono) {
  app.post("/api/admin/notifications/mark-read", async (c) => {
    const { notificationId } = await c.req.json();
    const claim = await getClaim(c);

    if (isNaN(notificationId)) {
      return c.json({ message: "Invalid notification ID." }, 400);
    }

    try {
      const notification = getNotificationById(notificationId);
      if (!notification) {
        return c.json({ message: "Notification not found." }, 404);
      }

      if (notification.target !== NotificationTarget.Admin) {
        return c.json({ message: "Unauthorized." }, 401);
      }

      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }

        if (notification.campusId !== admin.campus) {
          return c.json({ message: "Unauthorized." }, 401);
        }
      }

      markNotificationAsRead(notificationId);
      return c.json({ message: "Notification marked as read." });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
