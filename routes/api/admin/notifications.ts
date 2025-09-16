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
          return c.json({ message: "未找到管理员。" }, 404);
        }
        notifications = getNotificationsForAdmin(admin.campus);
      } else {
        return c.json({ message: "未授权访问。" }, 403);
      }
      return c.json(notifications);
    } catch (error) {
      console.error("获取管理员通知时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
