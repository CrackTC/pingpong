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
      console.error("Error fetching coach cancel count:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
