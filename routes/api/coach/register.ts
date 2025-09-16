import { Hono } from "hono";
import {
  addCoach,
  getCoachByUsername,
  searchCoachesByIdCardOrPhone,
} from "../../../data/coachDao.ts";
import { getCampusById } from "../../../data/campusDao.ts";
import { Sex } from "../../../models/sex.ts";
import { validatePassword } from "../../../utils.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiCoachRegister(app: Hono) {
  app.post("/api/coach/register", async (c) => {
    const formData = await c.req.formData();

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const realName = formData.get("realName") as string;
    const sex = formData.get("sex") != "null"
      ? parseInt(formData.get("sex") as string)
      : null;
    const birthYear = formData.get("birthYear") != "null"
      ? parseInt(formData.get("birthYear") as string)
      : null;
    const campusId = parseInt(formData.get("campusId") as string);
    const phone = formData.get("phone") as string;
    const email = formData.get("email") != "null"
      ? formData.get("email") as string
      : null;
    const idCardNumber = formData.get("idCardNumber") as string;
    const comment = formData.get("comment") as string;
    const avatarFile = formData.get("avatar") as File;

    // Basic validation
    if (!username || username.trim() === "") {
      return c.json({ success: false, message: "用户名为必填项。" }, 400);
    }
    if (!password || password.trim() === "") {
      return c.json({ success: false, message: "密码为必填项。" }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return c.json({ success: false, message: passwordError }, 400);
    }

    if (!realName || realName.trim() === "") {
      return c.json({ success: false, message: "真实姓名为必填项。" }, 400);
    }
    // Sex is optional
    if (sex !== null && sex !== undefined && (isNaN(sex) || !(sex in Sex))) {
      return c.json({
        success: false,
        message: "如果提供，则需要有效的性别。",
      }, 400);
    }
    // Birth Year is optional
    if (
      birthYear !== null && birthYear !== undefined &&
      (isNaN(birthYear) || birthYear < 1900 ||
        birthYear > new Date().getFullYear())
    ) {
      return c.json({
        success: false,
        message: "如果提供，则需要有效的出生年份。",
      }, 400);
    }
    if (isNaN(campusId)) {
      return c.json({ success: false, message: "校区为必填项。" }, 400);
    }
    if (!phone || !/^\d{11}$/.test(phone)) {
      return c.json(
        { success: false, message: "手机号码必须是11位数字。" },
        400,
      );
    }
    if (!idCardNumber || !/^\d{18}$/.test(idCardNumber)) {
      return c.json({
        success: false,
        message: "身份证号码必须是18位数字。",
      }, 400);
    }
    if (!comment || comment.trim() === "") {
      return c.json({ success: false, message: "评论为必填项。" }, 400);
    }

    // Check if username already exists
    const existingCoach = getCoachByUsername(username);
    if (existingCoach) {
      return c.json(
        { success: false, message: "用户名已存在。" },
        409,
      );
    }

    // Check if phone or ID card number already exists
    let existingCoachByPhoneOrIdCard = searchCoachesByIdCardOrPhone(
      phone,
      campusId,
    );
    if (existingCoachByPhoneOrIdCard.length == 0) {
      existingCoachByPhoneOrIdCard = searchCoachesByIdCardOrPhone(
        idCardNumber,
        campusId,
      );
    }

    if (existingCoachByPhoneOrIdCard.length > 0) {
      return c.json(
        {
          success: false,
          message: "手机号码或身份证号码已注册。",
        },
        409,
      );
    }

    // Check if campusId is valid
    const campus = getCampusById(campusId);
    if (!campus) {
      return c.json({ success: false, message: "无效的校区ID。" }, 400);
    }

    let avatarPath: string = "";
    if (avatarFile && avatarFile.size > 0) {
      const uploadsDir = "static/avatars/coaches";
      await Deno.mkdir(uploadsDir, { recursive: true });
      const filename = `${crypto.randomUUID()}-${avatarFile.name}`;
      avatarPath = `/${uploadsDir}/${filename}`;
      await Deno.writeFile(
        `./${uploadsDir}/${filename}`,
        new Uint8Array(await avatarFile.arrayBuffer()),
      );
    } else {
      return c.json({ success: false, message: "头像为必填项。" }, 400);
    }

    try {
      const id = addCoach({
        username,
        password,
        realName,
        sex,
        birthYear,
        campusId,
        phone,
        email: email || null,
        idCardNumber: idCardNumber,
        avatarPath: avatarPath, // Store empty string if no avatar
        comment: comment,
      });
      addSystemLog({
        campusId,
        type: SystemLogType.CoachRegister,
        text: `新教练注册：${username} (${realName})`,
        relatedId: id,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("注册教练时出错：", error);
      return c.json({
        success: false,
        message: "发生意外错误。",
      }, 500);
    }
  });
}
