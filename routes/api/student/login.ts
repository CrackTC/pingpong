import { Hono } from "hono";
import { getStudentById, verifyStudent } from "../../../data/studentDao.ts";
import { Claim, setClaim } from "../../../auth/claim.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiStudentLogin(app: Hono) {
  app.post("/api/student/login", async (c) => {
    const { username, password } = await c.req.json();

    const id = verifyStudent(username, password);
    if (id) {
      const claim: Claim = {
        type: "student",
        id: id,
      };
      await setClaim(c, claim);
      const student = getStudentById(claim.id)!;
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentLogin,
        text: `Student ${student.realName} (ID: ${student.id}) logged in.`,
        relatedId: student.id,
      });
      return c.json({ success: true, redirect: "/student/home" }); // Assuming /student/home exists
    } else {
      return c.json({
        success: false,
        message: "Invalid username or password.",
      }, 401);
    }
  });
}
