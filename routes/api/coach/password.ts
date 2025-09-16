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
      return c.json({ message: "未授权" }, 401);
    }

    const coach = getCoachById(claim.id);
    if (!coach) {
      return c.json({ message: "未找到教练" }, 404);
    }

    // Verify current password
    if (!verifyCoach(coach.username, currentPassword)) {
      return c.json({ message: "当前密码无效" }, 400);
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
        text: `教练 ${coach.realName} (ID: ${coach.id}) 更改了密码。`,
        relatedId: coach.id,
      });
      return c.json({ message: "密码更改成功" });
    } catch (error) {
      console.error("更改教练密码时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
