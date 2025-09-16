import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  getSelectionByStudentAndCoachId,
  getSelectionCountForCoach,
} from "../../../../data/selectionDao.ts";
import {
  addMigration,
  getMigrationsByStudentId,
} from "../../../../data/migrationDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getStudentById } from "../../../../data/studentDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

const MAX_STUDENTS_PER_COACH = 20;

export function useApiStudentCoachChange(app: Hono) {
  app.post("/api/student/coach/change", async (c) => {
    const { oldCoachId, newCoachId } = await c.req.json();
    const claim = await getClaim(c);

    if (isNaN(oldCoachId) || isNaN(newCoachId)) {
      return c.json({ message: "无效的教练ID。" }, 400);
    }

    try {
      const selection = getSelectionByStudentAndCoachId(claim.id, oldCoachId);
      if (!selection) {
        return c.json({
          message: "您目前未被此教练选中。",
        }, 400);
      }

      const newCoachSelection = getSelectionByStudentAndCoachId(
        claim.id,
        newCoachId,
      );
      if (newCoachSelection) {
        return c.json(
          { message: "您已被新教练选中。" },
          400,
        );
      }

      const currentStudentCount = getSelectionCountForCoach(newCoachId);
      if (currentStudentCount >= MAX_STUDENTS_PER_COACH) {
        return c.json({
          message: `新教练已有 ${MAX_STUDENTS_PER_COACH} 名学生。`,
        }, 400);
      }

      const currentMigrations = getMigrationsByStudentId(claim.id);
      if (currentMigrations.length > 0) {
        return c.json({
          message: "您已有待处理的教练更换请求。",
        }, 400);
      }

      const oldCoach = getCoachById(oldCoachId);
      const newCoach = getCoachById(newCoachId);
      const student = getStudentById(claim.id);

      if (!oldCoach || !newCoach || !student) {
        return c.json({ message: "无效数据。" }, 400);
      }

      // Create migration record
      const id = addMigration({
        campusId: student.campusId,
        selectionId: selection.id,
        destCoachId: newCoachId,
        status: 1, // Pending
      });

      // Send notifications
      // To old coach
      addNotification(
        student.campusId,
        NotificationTarget.Coach,
        oldCoachId,
        `学生 ${student.realName} 已请求从您更换到其他教练。`,
        `/coach/migration/pending`, // Assuming a new page for migrations
        Date.now(),
      );

      // To new coach
      addNotification(
        student.campusId,
        NotificationTarget.Coach,
        newCoachId,
        `学生 ${student.realName} 已请求从其他教练更换到您。`,
        `/coach/migration/pending`,
        Date.now(),
      );

      // To admin
      addNotification(
        student.campusId,
        NotificationTarget.Admin,
        0, // Or a specific admin? For now, 0 for all admins in campus
        `学生 ${student.realName} 已请求从教练 ${oldCoach.realName} 更换到 ${newCoach.realName}。`,
        `/admin/migrations`,
        Date.now(),
      );

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentRequestMigration,
        text:
          `学生 ${student.realName} (ID: ${student.id}) 请求从教练 ${oldCoach.realName} (ID: ${oldCoach.id}) 更换到教练 ${newCoach.realName} (ID: ${newCoach.id})。`,
        relatedId: id,
      });

      return c.json({ message: "更换请求已成功发送。" });
    } catch (error) {
      console.error("请求更换教练时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
