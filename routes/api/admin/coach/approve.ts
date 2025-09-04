import { Hono } from "hono";
import { approveCoach } from "../../../../data/coachDao.ts";
import { CoachType } from "../../../../models/coach.ts";

export function useApiApproveCoach(app: Hono) {
  app.post("/api/admin/coach/approve", async (c) => {
    const { coachId, type } = await c.req.json();

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
