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
      return c.json({ message: "Invalid coach ID." }, 400);
    }

    try {
      const selection = getSelectionByStudentAndCoachId(claim.id, oldCoachId);
      if (!selection) {
        return c.json({
          message: "You are not currently selected by this coach.",
        }, 400);
      }

      const newCoachSelection = getSelectionByStudentAndCoachId(
        claim.id,
        newCoachId,
      );
      if (newCoachSelection) {
        return c.json(
          { message: "You are already selected by the new coach." },
          400,
        );
      }

      const currentStudentCount = getSelectionCountForCoach(newCoachId);
      if (currentStudentCount >= MAX_STUDENTS_PER_COACH) {
        return c.json({
          message:
            `The new coach already has ${MAX_STUDENTS_PER_COACH} students.`,
        }, 400);
      }

      const currentMigrations = getMigrationsByStudentId(claim.id);
      if (currentMigrations.length > 0) {
        return c.json({
          message: "You already have a pending coach change request.",
        }, 400);
      }

      const oldCoach = getCoachById(oldCoachId);
      const newCoach = getCoachById(newCoachId);
      const student = getStudentById(claim.id);

      if (!oldCoach || !newCoach || !student) {
        return c.json({ message: "Invalid data." }, 400);
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
        `Student ${student.realName} has requested to change from you to another coach.`,
        `/coach/migration/pending`, // Assuming a new page for migrations
        Date.now(),
      );

      // To new coach
      addNotification(
        student.campusId,
        NotificationTarget.Coach,
        newCoachId,
        `Student ${student.realName} has requested to change to you from another coach.`,
        `/coach/migration/pending`,
        Date.now(),
      );

      // To admin
      addNotification(
        student.campusId,
        NotificationTarget.Admin,
        0, // Or a specific admin? For now, 0 for all admins in campus
        `Student ${student.realName} has requested to change from coach ${oldCoach.realName} to ${newCoach.realName}.`,
        `/admin/migrations`,
        Date.now(),
      );

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentRequestMigration,
        text:
          `Student ${student.realName} (ID: ${student.id}) requested to change from coach ${oldCoach.realName} (ID: ${oldCoach.id}) to coach ${newCoach.realName} (ID: ${newCoach.id}).`,
        relatedId: id,
      });

      return c.json({ message: "Change request sent successfully." });
    } catch (error) {
      console.error("Error requesting coach change:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
