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
      console.error("Error fetching pending appointments:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
