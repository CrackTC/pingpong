import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAllTables } from "../../../../data/tableDao.ts";
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById

export function useApiAdminTableAll(app: Hono) {
  app.get("/api/admin/table/all", async (c) => {
    const claim = await getClaim(c);
    let campusIdFilter: number | undefined = undefined;

    if (claim.type === "admin") {
      const admin = getAdminById(claim.id); // Get admin details
      if (!admin) {
        return c.json({ message: "未找到管理员。" }, 404);
      }
      // Admin can only view tables of their own campus
      campusIdFilter = admin.campus; // Use admin.campus
    } else if (claim.type !== "root") {
      // Only root and admin can view tables
      return c.json({ message: "未授权" }, 403);
    }

    try {
      const tables = getAllTables(campusIdFilter);
      return c.json(tables);
    } catch (error) {
      console.error("获取球台时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
