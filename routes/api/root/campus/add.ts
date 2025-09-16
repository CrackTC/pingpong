import { Hono } from "hono";
import { addCampus, getCampusByName } from "../../../../data/campusDao.ts";
import { CampusType } from "../../../../models/campus.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAddCampus(app: Hono) {
  app.post("/api/root/campus/add", async (c) => {
    const { name, address, phone, email } = await c.req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return c.json(
        { success: false, message: "校区名称为必填项。" },
        400,
      );
    }
    if (!address || typeof address !== "string" || address.trim() === "") {
      return c.json({ success: false, message: "地址为必填项。" }, 400);
    }
    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return c.json({ success: false, message: "电话为必填项。" }, 400);
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
      return c.json({ success: false, message: "电子邮件为必填项。" }, 400);
    }

    const existingCampus = getCampusByName(name);
    if (existingCampus) {
      return c.json({
        success: false,
        message: "该名称校区已存在。",
      }, 409);
    }

    try {
      const id = addCampus({
        name,
        address,
        phone,
        email,
        type: CampusType.Branch,
      });
      addSystemLog({
        campusId: id,
        type: SystemLogType.CampusAdd,
        text: `校区 ${name} 已添加。`,
        relatedId: id,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("添加校区时出错：", error);
      return c.json({
        success: false,
        message: "发生意外错误。",
      }, 500);
    }
  });
}
