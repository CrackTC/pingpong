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
      return c.json({ message: "Student not found" }, 404);
    }

    const coach = getCoachById(coachId);
    if (!coach) {
      return c.json({ message: "Coach not found" }, 404);
    }

    if (coach.type === CoachType.Pending) {
      return c.json({
        message:
          "This coach is currently pending approval and cannot be selected.",
      }, 400);
    }

    // Check if student already has an active selection with this specific coach
    const existingSelection = getSelectionByStudentAndCoachId(
      student.id,
      coachId,
    );
    if (existingSelection) {
      return c.json({
        message: "You have already made a selection to this coach.",
      }, 400);
    }

    // Check if student already has 2 active selections
    const activeSelectionCount = getActiveSelectionCountForStudent(student.id);
    if (activeSelectionCount >= 2) {
      return c.json({
        message:
          "You already have 2 pending or approved coach selections. You cannot select more coaches.",
      }, 400);
    }

    const currentStudentCount = getSelectionCountForCoach(coachId);
    if (currentStudentCount >= MAX_STUDENTS_PER_COACH) {
      return c.json({
        message: `Coach already has ${MAX_STUDENTS_PER_COACH} students.`,
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
        `New student selection request from ${student.realName}`,
        `/coach/selection/pending`, // Link for coach to view pending selections
        Date.now(),
      );
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentSelectCoach,
        text:
          `Student ${student.realName} (ID: ${student.id}) selected Coach ${coach.realName} (ID: ${coach.id}).`,
        relatedId: id,
      });
      return c.json({
        message:
          "Coach selection request sent successfully. Waiting for coach approval.",
      });
    } catch (error) {
      console.error("Error selecting coach:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
