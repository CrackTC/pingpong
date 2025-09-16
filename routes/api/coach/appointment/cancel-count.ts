import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getCoachCancelCountThisMonth } from "../../../../data/appointmentDao.ts";

export function useApiCoachAppointmentCancelCount(app: Hono) {
  app.get("/api/coach/appointment/cancel-count", async (c) => {
    const claim = await getClaim(c);
    const coachId = claim.id;

    try {
      const cancelCount = getCoachCancelCountThisMonth(coachId);
      return c.json({ cancelCount });
    } catch (error) {
      console.error("获取教练取消次数时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
