import { Hono } from "hono";
import { getTimeslotById } from "../../../../data/timeslotDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getAvailableTables } from "../../../../data/tableDao.ts";

export function useApiStudentTableAvailable(app: Hono) {
  app.post("/api/student/table/available", async (c) => {
    const { timeslotId } = await c.req.json();

    if (isNaN(timeslotId)) {
      return c.json({ message: "Invalid timeslot ID." }, 400);
    }

    try {
      const timeslot = getTimeslotById(timeslotId);
      if (!timeslot) {
        return c.json({ message: "Timeslot not found." }, 404);
      }

      const coach = getCoachById(timeslot.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found." }, 404);
      }

      const availableTables = getAvailableTables(coach.campusId, timeslot);
      return c.json(availableTables);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
