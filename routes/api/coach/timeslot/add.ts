import { Hono } from "hono";
import { addTimeslot, hasTimeslotOverlap } from "../../../../data/timeslotDao.ts";
import { getClaim } from "../../../../auth/claim.ts";

export function useApiCoachTimeslotAdd(app: Hono) {
  app.post("/api/coach/timeslot/add", async (c) => {
    const timeslotData = await c.req.json();
    const claim = await getClaim(c);

    timeslotData.coachId = claim.id; // Set coachId from claim for coaches

    // Validate time order (start before end)
    const startTotalMinutes = timeslotData.startHour * 60 + timeslotData.startMinute;
    const endTotalMinutes = timeslotData.endHour * 60 + timeslotData.endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
      return c.json({ message: "End time must be after start time." }, 400);
    }

    // Check for overlap
    if (hasTimeslotOverlap(
      timeslotData.weekday,
      timeslotData.startHour,
      timeslotData.startMinute,
      timeslotData.endHour,
      timeslotData.endMinute,
      timeslotData.coachId,
    )) {
      return c.json({ message: "Timeslot overlaps with an existing timeslot." }, 400);
    }

    try {
      addTimeslot(timeslotData);
      return c.json({ message: "Timeslot added successfully!" });
    } catch (error) {
      console.error("Error adding timeslot:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
