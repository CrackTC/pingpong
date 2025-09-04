import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getNotificationsForUser } from "../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../models/notification.ts";

export function useApiStudentNotifications(app: Hono) {
  app.get("/api/student/notifications", async (c) => {
    const claim = await getClaim(c);

    try {
      const notifications = getNotificationsForUser(claim.id, NotificationTarget.Student);
      return c.json(notifications);
    } catch (error) {
      console.error("Error fetching student notifications:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
