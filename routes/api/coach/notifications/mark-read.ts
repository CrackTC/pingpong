import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  getNotificationById,
  markNotificationAsRead,
} from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";

export function useApiCoachNotificationsMarkRead(app: Hono) {
  app.post("/api/coach/notifications/mark-read", async (c) => {
    const { notificationId } = await c.req.json();
    const claim = await getClaim(c);

    const notification = getNotificationById(notificationId);

    if (!notification) {
      return c.json({ message: "未找到通知" }, 404);
    }

    // Check if the notification belongs to the authenticated coach
    if (
      notification.targetId !== claim.id ||
      notification.target !== NotificationTarget.Coach
    ) {
      return c.json({ message: "无权将此通知标记为已读" }, 403);
    }

    try {
      markNotificationAsRead(notificationId);
      return c.json({ message: "通知已标记为已读" });
    } catch (error) {
      console.error("标记通知为已读时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
