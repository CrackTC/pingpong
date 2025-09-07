import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";

export function useApiCoachAppointmentAll(app: Hono) {
  app.get("/api/coach/appointment/all", async (c) => {
    const claim = await getClaim(c);
    const coachId = claim.id;

    try {
      const appointments = getAppointmentsByCoachId(coachId);
      return c.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
