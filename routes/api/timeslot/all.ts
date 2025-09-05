import { Hono } from "hono";
import { getAllTimeslots } from "../../../data/timeslotDao.ts";

export function useApiTimeslotAll(app: Hono) {
  app.get("/api/timeslot/all", (c) => {
    try {
      const timeslots = getAllTimeslots();
      return c.json({ timeslots });
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
