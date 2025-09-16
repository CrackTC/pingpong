import { Hono } from "hono";
import { getAdminById, verifyAdmin } from "../../../data/adminDao.ts";
import { Claim, setClaim } from "../../../auth/claim.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiAdminLogin(app: Hono) {
  app.post("/api/admin/login", async (c) => {
    const { username, password } = await c.req.json();

    const id = verifyAdmin(username, password);
    if (id) {
      const claim: Claim = {
        type: "admin",
        id: id,
      };
      await setClaim(c, claim);

      const admin = getAdminById(id);
      addSystemLog({
        campusId: admin!.campus,
        type: SystemLogType.AdminLogin,
        text: `管理员 ${admin?.username} (ID: ${admin?.id}) 已登录。`,
        relatedId: admin?.id ?? 0,
      });

      return c.json({ success: true, redirect: "/admin/home" }); // Assuming /admin/home exists
    } else {
      return c.json({
        success: false,
        message: "用户名或密码无效。",
      }, 401);
    }
  });
}
