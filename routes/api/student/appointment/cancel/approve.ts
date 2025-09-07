import { Hono } from "hono";
import { getAppointmentById, updateAppointmentStatus } from "../../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../../models/appointment.ts";
import { addNotification } from "../../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../../models/notification.ts";
import { getStudentById } from "../../../../../data/studentDao.ts";

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

      if (appointment.status !== AppointmentStatus.CoachCancelling) {
        return c.json({ message: "This appointment is not pending cancellation by the coach." }, 400);
      }

      const student = getStudentById(appointment.studentId);
      if (!student) {
        return c.json({ message: "Student not found" }, 404);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.CoachCancelled);

      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `Student ${student.realName} has approved your cancellation request.`,
        `/coach/appointment/all`,
        Date.now()
      );

      return c.json({ message: "Cancellation approved." });
    } catch (error) {
      console.error("Error approving cancellation:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
