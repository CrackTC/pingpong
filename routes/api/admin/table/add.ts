import { Hono } from "hono";
import {
  addTable,
  getTableByNameAndCampusId,
} from "../../../../data/tableDao.ts"; // Import getTableByNameAndCampusId
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminTableAdd(app: Hono) {
  app.post("/api/admin/table/add", async (c) => {
    const { name, campusId: inputCampusId } = await c.req.json();
    const claim = await getClaim(c);

    let actualCampusId = inputCampusId;

    if (claim.type === "admin") {
      const admin = getAdminById(claim.id); // Get admin details
      if (!admin) {
        return c.json({ message: "未找到管理员。" }, 404);
      }
      // Admin can only add tables to their own campus
      if (inputCampusId && inputCampusId !== admin.campus) { // Use admin.campus
        return c.json({
          message: "管理员只能在自己的校区添加球台。",
        }, 403);
      }
      actualCampusId = admin.campus; // Use admin.campus
    } else if (claim.type !== "root") {
      // Only root and admin can add tables
      return c.json({ message: "未授权" }, 403);
    }

    if (!name || !actualCampusId) {
      return c.json({ message: "球台名称和校区ID是必填项。" }, 400);
    }

    // Check if table with same name already exists in the same campus
    const existingTable = getTableByNameAndCampusId(name, actualCampusId);
    if (existingTable) {
      return c.json({
        message: "该校区已存在同名球台。",
      }, 409); // 409 Conflict
    }

    try {
      const id = addTable({ name, campusId: actualCampusId });
      addSystemLog({
        campusId: actualCampusId,
        type: SystemLogType.TableAdd,
        text:
          `管理员 ${claim.id} 已将球台 '${name}' 添加到校区 ID ${actualCampusId}。`,
        relatedId: id, // No specific related ID
      });
      return c.json({ message: "球台添加成功！" });
    } catch (error) {
      console.error("添加球台时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
