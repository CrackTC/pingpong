import { Hono } from "hono";
import { deleteCoachById } from "../../../../data/coachDao.ts";
import { getActiveAppointmentsByCoachId, deleteAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";
import { deleteTimeslotsByCoachId } from "../../../../data/timeslotDao.ts";
import { deleteSelectionsByCoachId } from "../../../../data/selectionDao.ts";

export function useApiAdminCoachDelete(app: Hono) {
  app.post("/api/admin/coach/delete", async (c) => {
    const { coachId } = await c.req.json();

    if (isNaN(coachId)) {
      return c.json({ message: "Invalid coach ID." }, 400);
    }

    try {
      const activeAppointments = getActiveAppointmentsByCoachId(coachId);
      if (activeAppointments.length > 0) {
        return c.json({ message: "Cannot delete coach with active appointments." }, 400);
      }

      // Delete related data
      deleteAppointmentsByCoachId(coachId);
      deleteTimeslotsByCoachId(coachId);
      deleteSelectionsByCoachId(coachId);

      // Delete coach
      deleteCoachById(coachId);

      return c.json({ message: "Coach deleted successfully." });
    } catch (error) {
      console.error("Error deleting coach:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
