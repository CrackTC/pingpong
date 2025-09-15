import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { getCoachById } from "../../../../data/coachDao.ts";

export function useApiCoachAppointmentReject(app: Hono) {
  app.post("/api/coach/appointment/reject", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found." }, 404);
      }

      const claim = await getClaim(c);
      if (claim.id !== appointment.coachId) {
        return c.json({
          message: "You are not authorized to reject this appointment.",
        }, 403);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.Rejected);

      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `Your appointment has been rejected by the coach.`,
        "/student/appointment/all",
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.CoachRejectAppointment,
        text:
          `Coach ${coach.realName} (ID: ${coach.id}) rejected appointment ID: ${appointment.id}.`,
        relatedId: appointment.id,
      });

      return c.json({ message: "Appointment rejected successfully." });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
