import { Hono } from "hono";
import { getActiveAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";

export function useApiAdminCoachAppointments(app: Hono) {
  app.get("/api/admin/coach/appointments/:id", async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "Coach ID is required." }, 400);
    }

    const claim = await getClaim(c);
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ success: false, message: "Admin not found." }, 404);
      }
      const coach = getCoachById(parseInt(id));
      if (!coach) {
        return c.json({ success: false, message: "Coach not found." }, 404);
      }
      if (admin.campus != coach.campusId) {
        return c.json({
          success: false,
          message:
            "You do not have permission to view this coach's appointments.",
        }, 403);
      }
    }

    try {
      const appointments = getActiveAppointmentsByCoachId(parseInt(id));
      return c.json(appointments);
    } catch (error) {
      console.error("Error fetching active appointments:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
