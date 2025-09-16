import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getSystemLogs } from "../../../data/systemLogDao.ts";
import { getAdminById } from "../../../data/adminDao.ts";

export function useApiAdminSystemLogs(app: Hono) {
  app.get("/api/admin/system-logs", async (c) => {
    const claim = await getClaim(c);

    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ message: "未找到管理员。" }, 404);
      }
      const logs = getSystemLogs(admin.campus);
      return c.json(logs);
    } else if (claim.type === "root") {
      const logs = getSystemLogs(); // Get all logs for root
      return c.json(logs);
    } else {
      return c.json({ message: "未授权。" }, 403);
    }
  });
}
