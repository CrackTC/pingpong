import { Hono } from "hono";
import {
  getAppointmentById,
  getCoachCancelCountThisMonth,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { calcDate } from "../../../../utils.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachAppointmentCancel(app: Hono) {
  app.post("/api/coach/appointment/cancel", async (c) => {
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
        return c.json({ message: "Unauthorized." }, 403);
      }

      if (appointment.status !== AppointmentStatus.Approved) {
        return c.json(
          { message: "Only approved appointments can be cancelled." },
          400,
        );
      }

      const count = getCoachCancelCountThisMonth(claim.id);
      if (count == 3) {
        return c.json(
          {
            message:
              "You have reached the maximum of 3 cancellations this month. Please contact support for further assistance.",
          },
          400,
        );
      }

      const startDate = calcDate(
        appointment.createdAt,
        appointment.weekday,
        appointment.startHour,
        appointment.startMinute,
      );

      if (startDate.getTime() - (new Date().getTime()) < 24 * 60 * 60 * 1000) {
        return c.json(
          { message: "Cannot cancel appointment within 24 hours." },
          400,
        );
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found" }, 404);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.CoachCancelling);

      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `Coach ${coach.realName} has requested to cancel an appointment.`,
        `/student/appointment/cancelling`,
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.CoachCancelAppointment,
        text:
          `Coach ${coach.realName} requested cancellation for appointment ID ${appointment.id}.`,
        relatedId: appointment.id,
      });

      return c.json({ message: "Appointment cancellation request sent." });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
