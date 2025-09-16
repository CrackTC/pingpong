import { Hono } from "hono";
import {
  addCoach,
  getCoachByUsername,
  searchCoachesByIdCardOrPhone,
} from "../../../../data/coachDao.ts";
import { getCampusById } from "../../../../data/campusDao.ts";
import { Sex } from "../../../../models/sex.ts";
import { CoachType } from "../../../../models/coach.ts"; // Import CoachType
import { validatePassword } from "../../../../utils.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminCoachAdd(app: Hono) {
  app.post("/api/admin/coach/add", async (c) => {
    const formData = await c.req.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const realName = formData.get("realName") as string;
    const sex = formData.get("sex")
      ? parseInt(formData.get("sex") as string)
      : null;
    const birthYear = formData.get("birthYear")
      ? parseInt(formData.get("birthYear") as string)
      : null;
    const campusId = parseInt(formData.get("campusId") as string);
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const idCardNumber = formData.get("idCardNumber") as string;
    const comment = formData.get("comment") as string;
    const avatarFile = formData.get("avatar") as File;
    const type = parseInt(formData.get("type") as string);

    // Validate coach type
    if (isNaN(type) || !(type in CoachType) || type === CoachType.Pending) {
      return c.json(
        { success: false, message: "无效的教练类型。" },
        400,
      );
    }

    // Basic validation
    if (!username || typeof username !== "string" || username.trim() === "") {
      return c.json({ success: false, message: "请填写用户名。" }, 400);
    }

    if (!password || password.trim() === "") {
      return c.json({ success: false, message: "请填写密码。" }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return c.json({ success: false, message: passwordError }, 400);
    }

    if (!realName || typeof realName !== "string" || realName.trim() === "") {
      return c.json({ success: false, message: "请填写真实姓名。" }, 400);
    }
    if (
      sex !== null && sex !== undefined &&
      (typeof sex !== "number" || !(sex in Sex))
    ) {
      return c.json({
        success: false,
        message: "请提供有效的性别。",
      }, 400);
    }
    if (
      birthYear !== null && birthYear !== undefined &&
      (typeof birthYear !== "number" || birthYear < 1900 ||
        birthYear > new Date().getFullYear())
    ) {
      return c.json({
        success: false,
        message: "请提供有效的出生年份。",
      }, 400);
    }
    if (isNaN(campusId)) {
      return c.json({ success: false, message: "请提供有效的校区ID。" }, 400);
    }
    if (!phone || !/^\d{11}$/.test(phone)) {
      return c.json(
        { success: false, message: "手机号必须是11位数字。" },
        400,
      );
    }
    if (!idCardNumber || !/^\d{18}$/.test(idCardNumber)) {
      return c.json({
        success: false,
        message: "身份证号码必须是18位数字。",
      }, 400);
    }

    // Check if username already exists
    const existingCoach = getCoachByUsername(username);
    if (existingCoach) {
      return c.json(
        { success: false, message: "用户名已被占用。" },
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
          message: "手机号或身份证号码已被占用。",
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
    }

    try {
      const coachId = addCoach({
        username,
        password,
        realName,
        sex,
        birthYear,
        campusId,
        phone,
        email: email || null,
        idCardNumber: idCardNumber,
        avatarPath: avatarPath,
        comment: comment,
        type: type, // Pass the selected type
      });

      addSystemLog({
        type: SystemLogType.CoachAdd,
        campusId: campusId,
        relatedId: coachId,
        text: `教练 ${realName} (用户名: ${username}) 被添加，类型为 ${
          CoachType[type]
        }。`,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("添加教练时发生错误", error);
      return c.json({
        success: false,
        message: "未知错误",
      }, 500);
    }
  });
}
