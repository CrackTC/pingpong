import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../../models/appointment.ts";
import { addNotification } from "../../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../../models/notification.ts";
import { getCoachById } from "../../../../../data/coachDao.ts";
import {
  deleteDeductionById,
  getDeductionByRelatedId,
} from "../../../../../data/deductionDao.ts";
import { updateStudentBalance } from "../../../../../data/studentDao.ts";
import { DeductionType } from "../../../../../models/deduction.ts";
import { getClaim } from "../../../../../auth/claim.ts";
import { addSystemLog } from "../../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../../models/systemLog.ts";

export function useApiCoachApproveCancellation(app: Hono) {
  app.post("/api/coach/appointment/cancel/approve", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
      }

      const claim = await getClaim(c);
      if (claim.id !== appointment.coachId) {
        return c.json({
          message: "You are not authorized to approve this cancellation.",
        }, 403);
      }

      if (appointment.status !== AppointmentStatus.StudentCancelling) {
        return c.json({
          message:
            "This appointment is not pending cancellation by the student.",
        }, 400);
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found" }, 404);
      }

      // Refund the student
      const deduction = getDeductionByRelatedId(
        appointmentId,
        DeductionType.Appointment,
      );
      if (deduction) {
        updateStudentBalance(appointment.studentId, deduction.amount);
        deleteDeductionById(deduction.id);
      }

      updateAppointmentStatus(
        appointmentId,
        AppointmentStatus.StudentCancelled,
      );

      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `Coach ${coach.realName} has approved your cancellation request.`,
        `/student/appointment/all`,
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.CoachApproveCancel,
        text:
          `Coach ${coach.realName} approved cancellation for appointment ID ${appointmentId}.`,
        relatedId: appointment.id,
      });

      return c.json({ message: "Cancellation approved." });
    } catch (error) {
      console.error("Error approving cancellation:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
