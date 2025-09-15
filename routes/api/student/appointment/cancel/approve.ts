import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../../models/appointment.ts";
import { addNotification } from "../../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../../models/notification.ts";
import {
  getStudentById,
  updateStudentBalance,
} from "../../../../../data/studentDao.ts";
import {
  deleteDeductionById,
  getDeductionByRelatedId,
} from "../../../../../data/deductionDao.ts";
import { DeductionType } from "../../../../../models/deduction.ts";
import { getClaim } from "../../../../../auth/claim.ts";
import { addSystemLog } from "../../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../../models/systemLog.ts";

export function useApiStudentApproveCancellation(app: Hono) {
  app.post("/api/student/appointment/cancel/approve", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
      }

      const student = getStudentById(appointment.studentId);
      if (!student) {
        return c.json({ message: "Student not found" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.id !== student.id) {
        return c.json({
          message: "You are not authorized to approve this cancellation.",
        }, 403);
      }

      if (appointment.status !== AppointmentStatus.CoachCancelling) {
        return c.json({
          message: "This appointment is not pending cancellation by the coach.",
        }, 400);
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

      updateAppointmentStatus(appointmentId, AppointmentStatus.CoachCancelled);

      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `Student ${student.realName} has approved your cancellation request.`,
        `/coach/appointment/all`,
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.StudentApproveCancel,
        text:
          `Student ${student.realName} (ID: ${student.id}) approved cancellation for appointment ID ${appointment.id}.`,
        relatedId: appointment.id,
      });

      return c.json({ message: "Cancellation approved." });
    } catch (error) {
      console.error("Error approving cancellation:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
