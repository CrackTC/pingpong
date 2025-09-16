import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getStudentById } from "../../../../data/studentDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { CoachType } from "../../../../models/coach.ts";
import {
  addSelection,
  getActiveSelectionCountForStudent,
  getSelectionByStudentAndCoachId,
  getSelectionCountForCoach,
} from "../../../../data/selectionDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

const MAX_STUDENTS_PER_COACH = 20;

export function useApiStudentSelectCoach(app: Hono) {
  app.post("/api/student/coach/select", async (c) => {
    const { coachId } = await c.req.json();
    const claim = await getClaim(c);

    const student = getStudentById(claim.id);
    if (!student) {
      return c.json({ message: "未找到学生" }, 404);
    }

    const coach = getCoachById(coachId);
    if (!coach) {
      return c.json({ message: "未找到教练" }, 404);
    }

    if (coach.type === CoachType.Pending) {
      return c.json({
        message:
          "此教练目前待批准，无法选择。",
      }, 400);
    }

    // Check if student already has an active selection with this specific coach
    const existingSelection = getSelectionByStudentAndCoachId(
      student.id,
      coachId,
    );
    if (existingSelection) {
      return c.json({
        message: "您已选择此教练。",
      }, 400);
    }

    // Check if student already has 2 active selections
    const activeSelectionCount = getActiveSelectionCountForStudent(student.id);
    if (activeSelectionCount >= 2) {
      return c.json({
        message:
          "您已有2个待处理或已批准的教练选择。您不能选择更多教练。",
      }, 400);
    }

    const currentStudentCount = getSelectionCountForCoach(coachId);
    if (currentStudentCount >= MAX_STUDENTS_PER_COACH) {
      return c.json({
        message: `教练已有 ${MAX_STUDENTS_PER_COACH} 名学生。`,
      }, 400);
    }

    try {
      const id = addSelection(
        student.id,
        coachId,
        student.campusId,
        SelectionStatus.Pending,
      );
      addNotification(
        student.campusId,
        NotificationTarget.Coach,
        coachId,
        `来自 ${student.realName} 的新学生选择请求`,
        `/coach/selection/pending`, // Link for coach to view pending selections
        Date.now(),
      );
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentSelectCoach,
        text:
          `学生 ${student.realName} (ID: ${student.id}) 选择了教练 ${coach.realName} (ID: ${coach.id})。`,
        relatedId: id,
      });
      return c.json({
        message:
          "教练选择请求已成功发送。等待教练批准。",
      });
    } catch (error) {
      console.error("选择教练时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
