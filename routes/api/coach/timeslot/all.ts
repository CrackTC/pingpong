import { Hono } from "hono";
import { getAllTimeslots } from "../../../../data/timeslotDao.ts";
import { getClaim } from "../../../../auth/claim.ts"; // Import getClaim

export function useApiCoachTimeslotAll(app: Hono) { // Renamed function
  app.get("/api/coach/timeslot/all", async (c) => {
    const claim = await getClaim(c);
    const timeslots = getAllTimeslots(claim.id); // Pass coachId
    return c.json({ timeslots });
  });
}
