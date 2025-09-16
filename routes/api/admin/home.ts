import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import {
  getUnreadNotificationCountForAdmin,
} from "../../../data/notificationDao.ts";
import { getAdminById } from "../../../data/adminDao.ts";

export function useApiAdminHome(app: Hono) {
  app.get("/api/admin/home", async (c) => {
    const claim = await getClaim(c);
    if (claim.type === "root") {
      const unreadCount = getUnreadNotificationCountForAdmin();
      return c.json({ unreadNotificationCount: unreadCount });
    } else if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ message: "未找到管理员。" }, 404);
      }
      const unreadCount = getUnreadNotificationCountForAdmin(admin.campus);
      return c.json({ unreadNotificationCount: unreadCount });
    } else {
      return c.json({ message: "未授权。" }, 403);
    }
  });
}
