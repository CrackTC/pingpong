import { Hono } from "hono";
import {
  addStudent,
  getStudentByPhoneAndCampus,
  getStudentByUsername,
} from "../../../data/studentDao.ts";
import { getCampusById } from "../../../data/campusDao.ts";
import { Sex } from "../../../models/sex.ts";
import { validatePassword } from "../../../utils.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiStudentRegister(app: Hono) {
  app.post("/api/student/register", async (c) => {
    const {
      username,
      password,
      realName,
      sex,
      birthYear,
      campusId,
      phone,
      email,
    } = await c.req.json();

    // Basic validation
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

    if (!realName || typeof realName !== "string" || realName.trim() === "") {
      return c.json({ success: false, message: "真实姓名为必填项。" }, 400);
    }
    // Sex is optional
    if (
      sex !== null && sex !== undefined &&
      (typeof sex !== "number" || !(sex in Sex))
    ) {
      return c.json({
        success: false,
        message: "如果提供，则需要有效的性别。",
      }, 400);
    }
    // Birth Year is optional
    if (
      birthYear !== null && birthYear !== undefined &&
      (typeof birthYear !== "number" || birthYear < 1900 ||
        birthYear > new Date().getFullYear())
    ) {
      return c.json({
        success: false,
        message: "如果提供，则需要有效的出生年份。",
      }, 400);
    }
    if (typeof campusId !== "number") {
      return c.json({ success: false, message: "校区为必填项。" }, 400);
    }
    if (!phone || typeof phone !== "string" || !/^\d{11}$/.test(phone)) {
      return c.json(
        { success: false, message: "手机号码必须是11位数字。" },
        400,
      );
    }

    // Check if phone number already exists in the same campus
    const existingStudentWithPhone = getStudentByPhoneAndCampus(
      phone,
      campusId,
    );
    if (existingStudentWithPhone) {
      return c.json({
        success: false,
        message: "该校区已注册该手机号码。",
      }, 409);
    }

    // Check if username already exists
    const existingStudent = getStudentByUsername(username);
    if (existingStudent) {
      return c.json(
        { success: false, message: "用户名已存在。" },
        409,
      );
    }

    // Check if campusId is valid
    const campus = getCampusById(campusId);
    if (!campus) {
      return c.json({ success: false, message: "无效的校区ID。" }, 400);
    }

    try {
      const id = addStudent({
        username,
        password,
        realName,
        sex,
        birthYear,
        campusId,
        phone,
        email: email || null, // Store null if email is empty
      });
      addSystemLog({
        campusId,
        type: SystemLogType.StudentRegister,
        text: `新学生注册：${username} (ID: ${id})`,
        relatedId: id,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("注册学生时出错：", error);
      return c.json({
        success: false,
        message: "发生意外错误。",
      }, 500);
    }
  });
}
