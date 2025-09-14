import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { getStudentById } from "../../../../data/studentDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { calcDate } from "../../../../utils.ts";

export function useApiStudentAppointmentCancel(app: Hono) {
  app.post("/api/student/appointment/cancel", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
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

      const student = getStudentById(appointment.studentId);
      if (!student) {
        return c.json({ message: "Student not found" }, 404);
      }

      updateAppointmentStatus(
        appointmentId,
        AppointmentStatus.StudentCancelling,
      );

      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `Student ${student.realName} has requested to cancel an appointment.`,
        `/coach/appointment/cancelling`,
        Date.now(),
      );

      return c.json({ message: "Appointment cancellation request sent." });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
