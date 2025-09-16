import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getPendingAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";

export function useApiCoachAppointmentPending(app: Hono) {
  app.get("/api/coach/appointment/pending", async (c) => {
    const claim = await getClaim(c);
    const coachId = claim.id;

    try {
      const appointments = getPendingAppointmentsByCoachId(coachId);
      return c.json(appointments);
    } catch (error) {
      console.error("获取待处理预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
