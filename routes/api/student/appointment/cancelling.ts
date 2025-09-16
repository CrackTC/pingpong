import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getCoachCancellingAppointmentsByStudentId } from "../../../../data/appointmentDao.ts";

export function useApiStudentAppointmentCancelling(app: Hono) {
  app.get("/api/student/appointment/cancelling", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    try {
      const appointments = getCoachCancellingAppointmentsByStudentId(studentId);
      return c.json(appointments);
    } catch (error) {
      console.error("获取取消中的预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
