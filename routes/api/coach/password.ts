import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import {
  getCoachById,
  updateCoachPassword,
  verifyCoach,
} from "../../../data/coachDao.ts";
import { validatePassword } from "../../../utils.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiCoachPassword(app: Hono) {
  app.post("/api/coach/password", async (c) => {
    const { currentPassword, newPassword } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim || claim.type !== "coach") {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const coach = getCoachById(claim.id);
    if (!coach) {
      return c.json({ message: "Coach not found" }, 404);
    }

    // Verify current password
    if (!verifyCoach(coach.username, currentPassword)) {
      return c.json({ message: "Invalid current password" }, 400);
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return c.json({ message: passwordError }, 400);
    }

    try {
      updateCoachPassword(claim.id, newPassword);
      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachChangePassword,
        text:
          `Coach ${coach.realName} (ID: ${coach.id}) changed their password.`,
        relatedId: coach.id,
      });
      return c.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing coach password:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
