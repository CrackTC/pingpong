import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getStudentCancellingAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";

export function useApiCoachAppointmentCancelling(app: Hono) {
  app.get("/api/coach/appointment/cancelling", async (c) => {
    const claim = await getClaim(c);
    const coachId = claim.id;

    try {
      const appointments = getStudentCancellingAppointmentsByCoachId(coachId);
      return c.json(appointments);
    } catch (error) {
      console.error("获取取消中的预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
