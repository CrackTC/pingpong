import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import {
  getStudentById,
  getStudentByPhoneAndCampus,
  updateStudent,
} from "../../../data/studentDao.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiStudentEdit(app: Hono) {
  app.post("/api/student/edit", async (c) => {
    const { realName, sex, birthYear, phone, email } = await c.req.json();
    const claim = await getClaim(c);

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "手机号码必须是11位数字。" }, 400);
    }

    if (!claim || !claim.id) {
      return c.json({ message: "未授权" }, 401);
    }

    const currentStudent = getStudentById(claim.id);
    if (!currentStudent) {
      return c.json({ message: "未找到学生" }, 404);
    }

    // Check for duplicate phone number within the same campus, excluding the current student
    if (phone && phone !== currentStudent.phone) { // Only check if phone is provided and changed
      const existingStudentWithPhone = getStudentByPhoneAndCampus(
        phone,
        currentStudent.campusId,
        currentStudent.id,
      );
      if (existingStudentWithPhone) {
        return c.json({
          message: "该校区已注册该手机号码。",
        }, 409);
      }
    }

    try {
      updateStudent(claim.id, { realName, sex, birthYear, phone, email });
      addSystemLog({
        campusId: currentStudent.campusId,
        type: SystemLogType.StudentUpdate,
        text:
          `学生 ${currentStudent.realName} (ID: ${currentStudent.id}) 更新了他们的个人资料。`,
        relatedId: currentStudent.id,
      });
      return c.json({ message: "个人资料更新成功" });
    } catch (error) {
      console.error("更新学生个人资料时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
