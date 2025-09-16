import { Hono } from "hono";
import { addAdmin, getAdminByUsername } from "../../../../data/adminDao.ts";
import { getCampusById } from "../../../../data/campusDao.ts";
import { validatePassword } from "../../../../utils.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";

export function useApiAddAdmin(app: Hono) {
  app.post("/api/root/admin/add", async (c) => {
    const { username, password, campusId } = await c.req.json();

    if (!username || typeof username !== "string" || username.trim() === "") {
      return c.json({ success: false, message: "用户名为必填项。" }, 400);
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
      return c.json({ success: false, message: "密码为必填项。" }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return c.json({ success: false, message: passwordError }, 400);
    }

    if (!campusId || typeof campusId !== "number") {
      return c.json({
        success: false,
        message: "校区ID为必填项，且必须是数字。",
      }, 400);
    }

    const campus = getCampusById(campusId);
    if (!campus) {
      return c.json({ success: false, message: "未找到校区。" }, 400);
    }

    const existingAdmin = getAdminByUsername(username);
    if (existingAdmin) {
      return c.json({
        success: false,
        message: "该用户名管理员已存在。",
      }, 409);
    }

    try {
      const id = addAdmin(username, password, campusId);
      addSystemLog({
        campusId,
        type: SystemLogType.AdminAdd,
        text: `管理员 ${username} 已添加。`,
        relatedId: id,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("添加管理员时出错：", error);
      return c.json({
        success: false,
        message: "发生意外错误。",
      }, 500);
    }
  });
}
