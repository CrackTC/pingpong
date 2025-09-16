import { Hono } from "hono";
import { getUnreadNotificationCountForUser } from "../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../models/notification.ts";
import { getClaim } from "../../../auth/claim.ts";

export function useApiCoachHome(app: Hono) {
  app.get("/api/coach/home", async (c) => {
    const claim = await getClaim(c); // Get claim from middleware
    const unreadNotificationCount = getUnreadNotificationCountForUser(
      claim.id,
      NotificationTarget.Coach,
    );
    return c.json({ unreadNotificationCount });
  });
}
