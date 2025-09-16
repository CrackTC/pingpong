import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import {
  getStudentById,
  updateStudentPassword,
  verifyStudent,
} from "../../../data/studentDao.ts";
import { validatePassword } from "../../../utils.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiStudentPassword(app: Hono) {
  app.post("/api/student/password", async (c) => {
    const { currentPassword, newPassword } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim || claim.type !== "student") {
      return c.json({ message: "未授权" }, 401);
    }

    const student = getStudentById(claim.id);
    if (!student) {
      return c.json({ message: "未找到学生" }, 404);
    }

    // Verify current password
    if (!verifyStudent(student.username, currentPassword)) {
      return c.json({ message: "当前密码无效" }, 400);
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return c.json({ message: passwordError }, 400);
    }

    try {
      updateStudentPassword(claim.id, newPassword);
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentChangePassword,
        text: `学生 ${student.username} 更改了密码。`,
        relatedId: claim.id,
      });
      return c.json({ message: "密码更改成功" });
    } catch (error) {
      console.error("更改学生密码时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
