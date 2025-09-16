import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getNotificationsForUser } from "../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../models/notification.ts";

export function useApiCoachNotifications(app: Hono) {
  app.get("/api/coach/notifications", async (c) => {
    const claim = await getClaim(c);

    try {
      const notifications = getNotificationsForUser(claim.id, NotificationTarget.Coach);
      return c.json(notifications);
    } catch (error) {
      console.error("获取教练通知时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
