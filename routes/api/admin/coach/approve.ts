import { Hono } from "hono";
import { approveCoach, getCoachById } from "../../../../data/coachDao.ts"; // Import getCoachById
import { CoachType } from "../../../../models/coach.ts";
import { getClaim } from "../../../../auth/claim.ts"; // Import getClaim
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiApproveCoach(app: Hono) {
  app.post("/api/admin/coach/approve", async (c) => {
    const { coachId, type } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim) {
      return c.json({ success: false, message: "未授权" }, 401);
    }

    // Get coach's campusId
    const coach = getCoachById(coachId);
    if (!coach) {
      return c.json({ success: false, message: "未找到教练" }, 404);
    }

    // Admin-specific campus validation
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin || admin.campus !== coach.campusId) {
        return c.json({
          success: false,
          message: "管理员只能批准自己校区的教练。",
        }, 403);
      }
    }

    // Validate input
    if (!coachId || !type) {
      return c.json(
        { success: false, message: "缺少教练ID或类型" },
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
      return c.json({ success: false, message: "无效的教练类型" }, 400);
    }

    try {
      approveCoach(coachId, type as CoachType);
      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachApprove,
        text: `教练ID ${coachId} 已批准为 ${CoachType[type]}`,
        relatedId: coachId,
      });
      return c.json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ success: false, message: error.message }, 500);
      }
      return c.json({ success: false, message: "未知错误" }, 500);
    }
  });
}
