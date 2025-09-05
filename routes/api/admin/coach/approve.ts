import { Hono } from "hono";
import { approveCoach, getCoachById } from "../../../../data/coachDao.ts"; // Import getCoachById
import { CoachType } from "../../../../models/coach.ts";
import { getClaim } from "../../../../auth/claim.ts"; // Import getClaim
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById

export function useApiApproveCoach(app: Hono) {
  app.post("/api/admin/coach/approve", async (c) => {
    const { coachId, type } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    // Get coach's campusId
    const coach = await getCoachById(coachId);
    if (!coach) {
      return c.json({ success: false, message: "Coach not found" }, 404);
    }

    // Admin-specific campus validation
    if (claim.type === "admin") {
      const admin = await getAdminById(claim.id);
      if (!admin || admin.campus !== coach.campusId) {
        return c.json({ success: false, message: "Admin can only approve coaches from their own campus." }, 403);
      }
    }

    // Validate input
    if (!coachId || !type) {
      return c.json(
        { success: false, message: "Missing coachId or type" },
        400,
      );
    }

    // Validate coach type
    const validCoachTypes = [
      CoachType.Junior,
      CoachType.Intermediate,
      CoachType.Senior,
    ];
    if (!validCoachTypes.includes(type as CoachType)) {
      return c.json({ success: false, message: "Invalid coach type" }, 400);
    }

    try {
      approveCoach(coachId, type as CoachType);
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 500);
      }
      return c.json({ success: false, message: "Unknown error" }, 500);
    }
  });
}
