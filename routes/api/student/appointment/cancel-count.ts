import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getStudentCancelCountThisMonth } from "../../../../data/appointmentDao.ts";

export function useApiStudentAppointmentCancelCount(app: Hono) {
  app.get("/api/student/appointment/cancel-count", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    try {
      const cancelCount = getStudentCancelCountThisMonth(studentId);
      return c.json({ cancelCount });
    } catch (error) {
      console.error("获取学生取消次数时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
