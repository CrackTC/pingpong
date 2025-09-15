import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import {
  deleteDeductionById,
  getDeductionByRelatedId,
} from "../../../../data/deductionDao.ts";
import { updateStudentBalance } from "../../../../data/studentDao.ts";
import { DeductionType } from "../../../../models/deduction.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

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

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }
        if (admin.campus !== appointment.campusId) {
          return c.json({
            message:
              "Admin can only cancel appointments from their own campus.",
          }, 403);
        }
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

      updateAppointmentStatus(appointmentId, AppointmentStatus.AdminCancelled);

      // Notify student
      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `Your appointment has been cancelled by an administrator.`,
        `/student/appointment/all`,
        Date.now(),
      );

      // Notify coach
      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `An appointment has been cancelled by an administrator.`,
        `/coach/appointment/all`,
        Date.now(),
      );

      addSystemLog({
        type: SystemLogType.AdminCancelAppointment,
        campusId: appointment.campusId,
        relatedId: appointment.id,
        text:
          `Appointment ID ${appointment.id} cancelled by admin ${claim.id}.`,
      });

      return c.json({ message: "Appointment cancelled successfully." });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
