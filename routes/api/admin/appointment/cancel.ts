import { Hono } from "hono";
import { getAppointmentById, updateAppointmentStatus } from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { getDeductionByRelatedId, deleteDeductionById } from "../../../../data/deductionDao.ts";
import { updateStudentBalance } from "../../../../data/studentDao.ts";
import { DeductionType } from "../../../../models/deduction.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";

export function useApiAdminAppointmentCancel(app: Hono) {
  app.post("/api/admin/appointment/cancel", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
      }

      // Refund the student
      const deduction = getDeductionByRelatedId(appointmentId, DeductionType.Appointment);
      if (deduction) {
        updateStudentBalance(appointment.studentId, deduction.amount);
        deleteDeductionById(deduction.id);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.AdminCancelled);

      // Notify student
      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `Your appointment has been cancelled by an administrator.`,
        `/student/appointment/all`,
        Date.now()
      );

      // Notify coach
      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `An appointment has been cancelled by an administrator.`,
        `/coach/appointment/all`,
        Date.now()
      );

      return c.json({ message: "Appointment cancelled successfully." });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
