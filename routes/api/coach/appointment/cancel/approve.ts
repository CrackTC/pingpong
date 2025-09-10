import { Hono } from "hono";
import { getAppointmentById, updateAppointmentStatus } from "../../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../../models/appointment.ts";
import { addNotification } from "../../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../../models/notification.ts";
import { getCoachById } from "../../../../../data/coachDao.ts";
import { getDeductionByRelatedId, deleteDeductionById } from "../../../../../data/deductionDao.ts";
import { updateStudentBalance } from "../../../../../data/studentDao.ts";
import { DeductionType } from "../../../../../models/deduction.ts";

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

      if (appointment.status !== AppointmentStatus.StudentCancelling) {
        return c.json({ message: "This appointment is not pending cancellation by the student." }, 400);
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found" }, 404);
      }

      // Refund the student
      const deduction = getDeductionByRelatedId(appointmentId, DeductionType.Appointment);
      if (deduction) {
        updateStudentBalance(appointment.studentId, deduction.amount);
        deleteDeductionById(deduction.id);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.StudentCancelled);

      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `Coach ${coach.realName} has approved your cancellation request.`,
        `/student/appointment/all`,
        Date.now()
      );

      return c.json({ message: "Cancellation approved." });
    } catch (error) {
      console.error("Error approving cancellation:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
