import { Hono } from "hono";
import { getCoachById, updateCoach } from "../../../../data/coachDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminCoachEdit(app: Hono) {
  app.post("/api/admin/coach/edit/:id", async (c) => {
    const coachId = parseInt(c.req.param("id"));
    const formData = await c.req.formData();

    const realName = formData.get("realName") as string;
    const sex = formData.get("sex") != "null"
      ? parseInt(formData.get("sex") as string)
      : null;
    const birthYear = formData.get("birthYear") != "null"
      ? parseInt(formData.get("birthYear") as string)
      : null;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") != "null"
      ? formData.get("email") as string
      : null;
    const idCardNumber = formData.get("idCardNumber") as string;
    const comment = formData.get("comment") as string;
    const type = formData.get("type") != "null"
      ? parseInt(formData.get("type") as string)
      : null;
    const avatarFile = formData.get("avatar") as File;

    if (isNaN(coachId)) {
      return c.json({ message: "无效的教练ID。" }, 400);
    }

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "手机号码必须是11位数字。" }, 400);
    }

    if (idCardNumber && !/^\d{18}$/.test(idCardNumber)) {
      return c.json({ message: "身份证号码必须是18位数字。" }, 400);
    }

    let avatarPath: string | undefined;
    if (avatarFile && avatarFile.size > 0) {
      const uploadsDir = "static/avatars/coaches";
      await Deno.mkdir(uploadsDir, { recursive: true });
      const filename = `${crypto.randomUUID()}-${avatarFile.name}`;
      avatarPath = `/${uploadsDir}/${filename}`;
      await Deno.writeFile(
        `./${uploadsDir}/${filename}`,
        new Uint8Array(await avatarFile.arrayBuffer()),
      );

      // Delete old avatar if it exists and is not the default
      const coach = getCoachById(coachId);
      if (
        coach && coach.avatarPath &&
        coach.avatarPath !== "/static/avatars/default.png"
      ) {
        try {
          await Deno.remove(`./${coach.avatarPath}`);
        } catch (e) {
          console.warn(`Could not delete old avatar: ${coach.avatarPath}`, e);
        }
      }
    }

    try {
      updateCoach(coachId, {
        realName,
        sex,
        birthYear,
        phone,
        email,
        idCardNumber,
        comment,
        type,
        avatarPath, // Pass the new avatar path
      });

      const coach = getCoachById(coachId);
      if (!coach) {
        return c.json({ message: "更新后未找到教练。" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        if (admin.campus !== coach.campusId) {
          return c.json({
            message: "管理员只能编辑自己校区的教练。",
          }, 403);
        }
      }

      addNotification(
        coach.campusId,
        NotificationTarget.Coach,
        coachId,
        "您的个人资料已由管理员更新。",
        "/coach/profile",
        Date.now(),
      );

      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachUpdate,
        text: `教练ID ${coachId} 的个人资料已由管理员ID ${claim.id} 更新`,
        relatedId: coachId,
      });

      return c.json({
        message: "教练个人资料更新成功",
        avatarPath: avatarPath || coach?.avatarPath,
      });
    } catch (error) {
      console.error("更新教练个人资料时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });

  app.get("/api/admin/coach/:id", (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ message: "无效的教练ID。" }, 400);
    }
    try {
      const coach = getCoachById(id);
      if (!coach) {
        return c.json({ message: "未找到教练。" }, 404);
      }
      return c.json(coach);
    } catch (error) {
      console.error("获取教练数据时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
