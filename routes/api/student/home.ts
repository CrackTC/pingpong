import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getUnreadNotificationCountForUser } from "../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../models/notification.ts";

export function useApiStudentHome(app: Hono) {
  app.get("/api/student/home", async (c) => {
    const claim = await getClaim(c);
    const unreadNotificationCount = getUnreadNotificationCountForUser(
      claim.id,
      NotificationTarget.Student,
    );
    return c.json({ unreadNotificationCount });
  });
}
