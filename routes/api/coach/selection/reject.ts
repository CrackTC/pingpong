import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  getSelectionById,
  updateSelectionStatus,
} from "../../../../data/selectionDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachSelectionReject(app: Hono) {
  app.post("/api/coach/selection/reject", async (c) => {
    const { selectionId } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim || claim.type !== "coach") {
      return c.json({ message: "未授权" }, 401);
    }

    const selection = getSelectionById(selectionId);

    if (!selection) {
      return c.json({ message: "未找到选择" }, 404);
    }

    if (selection.coachId !== claim.id) {
      return c.json({ message: "无权拒绝此选择" }, 403);
    }

    const coach = getCoachById(selection.coachId);
    if (!coach) {
      return c.json({ message: "未找到教练" }, 404);
    }

    try {
      updateSelectionStatus(selectionId, SelectionStatus.Rejected);
      addNotification(
        selection.campusId,
        NotificationTarget.Student,
        selection.studentId,
        `您对 ${coach.realName} 的教练选择请求已被拒绝。`, // Use coach.realName
        `/student/selection/all`, // Link to student's profile
        Date.now(),
      );
      addSystemLog({
        campusId: selection.campusId,
        type: SystemLogType.CoachRejectSelection,
        text:
          `教练 ${coach.realName} 拒绝了学生 ID ${selection.studentId} 的选择请求。`,
        relatedId: selectionId,
      });
      return c.json({ message: "选择成功拒绝" });
    } catch (error) {
      console.error("拒绝选择时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
