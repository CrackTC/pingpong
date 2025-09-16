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
      return c.json({ message: "无效的通知ID。" }, 400);
    }

    try {
      const notification = getNotificationById(notificationId);
      if (!notification) {
        return c.json({ message: "未找到通知。" }, 404);
      }

      if (notification.target !== NotificationTarget.Admin) {
        return c.json({ message: "未授权。" }, 401);
      }

      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }

        if (notification.campusId !== admin.campus) {
          return c.json({ message: "未授权。" }, 401);
        }
      }

      markNotificationAsRead(notificationId);
      return c.json({ message: "通知已标记为已读。" });
    } catch (error) {
      console.error("标记通知为已读时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
