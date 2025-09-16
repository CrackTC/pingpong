import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";
import { getReviewsByAppointmentId } from "../../../../data/reviewDao.ts";
import { ReviewType } from "../../../../models/review.ts";

export function useApiCoachAppointmentAll(app: Hono) {
  app.get("/api/coach/appointment/all", async (c) => {
    const claim = await getClaim(c);
    const coachId = claim.id;

    try {
      const appointments = getAppointmentsByCoachId(coachId);
      const appointmentsWithReviewStatus = appointments.map((appointment) => {
        const reviews = getReviewsByAppointmentId(appointment.id);
        const hasReview = reviews.some((r) =>
          r.type === ReviewType.CoachToStudent
        );
        return {
          ...appointment,
          hasReview,
        };
      });
      return c.json(appointmentsWithReviewStatus);
    } catch (error) {
      console.error("获取预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
