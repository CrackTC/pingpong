import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  getSelectionById,
  getSelectionCountForCoach,
  updateSelectionStatus,
} from "../../../../data/selectionDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { getCoachById } from "../../../../data/coachDao.ts"; // Import getCoachById
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachSelectionApprove(app: Hono) {
  app.post("/api/coach/selection/approve", async (c) => {
    const { selectionId } = await c.req.json();
    const claim = await getClaim(c);

    const selection = getSelectionById(selectionId);

    if (!selection) {
      return c.json({ message: "未找到选择" }, 404);
    }

    if (selection.coachId !== claim.id) {
      return c.json({ message: "无权批准此选择" }, 403);
    }

    const MAX_STUDENTS = 20;
    const approvedStudentCount = getSelectionCountForCoach(claim.id);
    if (approvedStudentCount >= MAX_STUDENTS) {
      return c.json({
        message: `教练已达到 ${MAX_STUDENTS} 名已批准学生的上限。`,
      }, 400);
    }

    const coach = getCoachById(selection.coachId); // Get coach details
    if (!coach) {
      return c.json({ message: "未找到教练" }, 404);
    }

    try {
      updateSelectionStatus(selectionId, SelectionStatus.Approved);
      addNotification(
        selection.campusId,
        NotificationTarget.Student,
        selection.studentId,
        `您对 ${coach.realName} 的教练选择请求已获批准！`, // Use coach.realName
        `/student/selection/all`, // Link to student's profile
        Date.now(),
      );
      addSystemLog({
        campusId: selection.campusId,
        type: SystemLogType.CoachApproveSelection,
        text:
          `教练 ${coach.realName} 批准了学生 ID ${selection.studentId} 的选择请求。`,
        relatedId: selection.id,
      });
      return c.json({ message: "选择成功批准" });
    } catch (error) {
      console.error("批准选择时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
