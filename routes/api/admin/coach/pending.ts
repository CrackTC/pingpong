import { Hono } from "hono";
import { getPendingCoaches } from "../../../../data/coachDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminCoachPending(app: Hono) {
  app.get("/api/admin/coach/pending", async (c) => {
    try {
      const claim = await getClaim(c);

      // 检查claim是否存在
      if (!claim) {
        return c.json({ message: "未登录" }, 401);
      }

      let coaches;
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员" }, 404);
        }
        coaches = getPendingCoaches(admin.campus);
      } else if (claim.type === "root") {
        coaches = getPendingCoaches();
      } else {
        return c.json({ message: "禁止访问" }, 403);
      }

      // 确保coaches是数组
      if (!Array.isArray(coaches)) {
        coaches = [];
      }

      return c.json(coaches);
    } catch (error) {
      console.error("获取待处理教练时出错:", error);
      return c.json({ message: "服务器内部错误" }, 500);
    }
  });
}
