import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getStudentCancellingAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";

export function useApiCoachAppointmentsCancelling(app: Hono) {
  app.get("/api/coach/appointments/cancelling", async (c) => {
    const claim = await getClaim(c);
    const coachId = claim.id;

    try {
      const appointments = getStudentCancellingAppointmentsByCoachId(coachId);
      return c.json(appointments);
    } catch (error) {
      console.error("Error fetching cancelling appointments:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
