import { Hono } from "hono";
import { addTimeslot, hasTimeslotOverlap } from "../../../../data/timeslotDao.ts"; // Import hasTimeslotOverlap
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById

export function useApiAdminTimeslotAdd(app: Hono) {
  app.post("/api/admin/timeslot/add", async (c) => {
    const timeslotData = await c.req.json();
    const claim = await getClaim(c);

    if (!claim) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Validate campusId based on user type
    if (claim.type === "admin") {
      const admin = await getAdminById(claim.id);
      if (!admin || timeslotData.campusId !== admin.campus) {
        return c.json({ message: "Admins can only add timeslots to their own campus." }, 403);
      }
    } else if (claim.type !== "root") { // Only root and admin can add timeslots
        return c.json({ message: "Forbidden" }, 403);
    }


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
      timeslotData.campusId,
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