import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAppointmentsByStudentId } from "../../../../data/appointmentDao.ts";
import { getReviewsByAppointmentId } from "../../../../data/reviewDao.ts";
import { ReviewType } from "../../../../models/review.ts";

export function useApiStudentAppointmentAll(app: Hono) {
  app.get("/api/student/appointment/all", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    try {
      const appointments = getAppointmentsByStudentId(studentId);
      const appointmentsWithReviewStatus = appointments.map(appointment => {
        const reviews = getReviewsByAppointmentId(appointment.id);
        const hasReview = reviews.some(r => r.type === ReviewType.StudentToCoach);
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
