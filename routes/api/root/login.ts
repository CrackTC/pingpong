import { Hono } from "hono";
import { verifyRoot } from "../../../data/rootDao.ts";
import { Claim, setClaim } from "../../../auth/claim.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiRootLogin(app: Hono) {
  app.post("/api/root/login", async (c) => {
    const { username, password } = await c.req.json();

    const id = verifyRoot(username, password);
    if (id) {
      const claim: Claim = {
        type: "root",
        id: id,
      };
      await setClaim(c, claim);
      addSystemLog({
        campusId: 1,
        type: SystemLogType.RootLogin,
        text: `超级管理员 ${username} 已登录。`,
        relatedId: id,
      });
      return c.json({ success: true, redirect: "/root/home" });
    } else {
      return c.json({
        success: false,
        message: "用户名或密码无效。",
      }, 401);
    }
  });
}
