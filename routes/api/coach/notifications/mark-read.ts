import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { markNotificationAsRead, getNotificationById } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";

export function useApiCoachNotificationsMarkRead(app: Hono) {
  app.post("/api/coach/notifications/mark-read", async (c) => {
    const { notificationId } = await c.req.json();
    const claim = await getClaim(c);

    const notification = getNotificationById(notificationId);

    if (!notification) {
      return c.json({ message: "Notification not found" }, 404);
    }

    // Check if the notification belongs to the authenticated coach
    if (notification.targetId !== claim.id || notification.target !== NotificationTarget.Coach) {
      return c.json({ message: "Unauthorized to mark this notification as read" }, 403);
    }

    try {
      markNotificationAsRead(notificationId);
      return c.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
