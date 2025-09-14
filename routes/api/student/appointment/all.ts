import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAppointmentsByStudentId } from "../../../../data/appointmentDao.ts";
import { getReviewByAppointmentId } from "../../../../data/reviewDao.ts";

export function useApiStudentAppointmentAll(app: Hono) {
  app.get("/api/student/appointment/all", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    try {
      const appointments = getAppointmentsByStudentId(studentId);
      const appointmentsWithReviewStatus = appointments.map(appointment => {
        const review = getReviewByAppointmentId(appointment.id);
        return {
          ...appointment,
          hasReview: !!review,
        };
      });
      return c.json(appointmentsWithReviewStatus);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
