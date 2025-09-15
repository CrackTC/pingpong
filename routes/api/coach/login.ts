import { Hono } from "hono";
import { getCoachByUsername, verifyCoach } from "../../../data/coachDao.ts";
import { Claim, setClaim } from "../../../auth/claim.ts";
import { CoachType } from "../../../models/coach.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiCoachLogin(app: Hono) {
  app.post("/api/coach/login", async (c) => {
    const { username, password } = await c.req.json();

    const id = verifyCoach(username, password);
    if (id) {
      const coach = getCoachByUsername(username);
      if (coach!.type === CoachType.Pending) {
        return c.json({
          success: false,
          message: "Your account is pending approval.",
        }, 403);
      }

      const claim: Claim = {
        type: "coach",
        id: id,
      };
      await setClaim(c, claim);
      addSystemLog({
        campusId: coach!.campusId,
        type: SystemLogType.CoachLogin,
        text: `Coach ${coach!.realName} (ID: ${coach!.id}) logged in.`,
        relatedId: coach!.id,
      });
      return c.json({ success: true, redirect: "/coach/home" }); // Assuming /coach/home exists
    } else {
      return c.json({
        success: false,
        message: "Invalid username or password.",
      }, 401);
    }
  });
}
