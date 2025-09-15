import { Hono } from "hono";
import { deleteCoachById, getCoachById } from "../../../../data/coachDao.ts";
import {
  deleteAppointmentsByCoachId,
  getActiveAppointmentsByCoachId,
} from "../../../../data/appointmentDao.ts";
import { deleteTimeslotsByCoachId } from "../../../../data/timeslotDao.ts";
import { deleteSelectionsByCoachId } from "../../../../data/selectionDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminCoachDelete(app: Hono) {
  app.post("/api/admin/coach/delete", async (c) => {
    const { coachId } = await c.req.json();

    if (isNaN(coachId)) {
      return c.json({ message: "Invalid coach ID." }, 400);
    }

    try {
      const coach = getCoachById(coachId);
      if (!coach) {
        return c.json({ message: "Coach not found." }, 404);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }
        if (admin.campus !== coach.campusId) {
          return c.json({
            message: "Admin can only delete coaches from their own campus.",
          }, 403);
        }
      }

      const activeAppointments = getActiveAppointmentsByCoachId(coachId);
      if (activeAppointments.length > 0) {
        return c.json({
          message: "Cannot delete coach with active appointments.",
        }, 400);
      }

      // Delete related data
      deleteAppointmentsByCoachId(coachId);
      deleteTimeslotsByCoachId(coachId);
      deleteSelectionsByCoachId(coachId);

      // Delete coach
      deleteCoachById(coachId);

      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachRemove,
        text: `Coach ID ${coachId} deleted by admin ${claim.id}`,
        relatedId: claim.id,
      });

      return c.json({ message: "Coach deleted successfully." });
    } catch (error) {
      console.error("Error deleting coach:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
