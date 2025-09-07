import { Hono } from "hono";
import { getAppointmentById, updateAppointmentStatus } from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";

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

      const now = new Date();
      const appointmentDate = new Date();
      appointmentDate.setHours(appointment.startHour, appointment.startMinute, 0, 0);

      let diff = appointment.weekday - now.getDay();
      if (diff < 0 || (diff === 0 && appointmentDate.getTime() < now.getTime())) {
        diff += 7;
      }
      appointmentDate.setDate(now.getDate() + diff);

      if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        return c.json({ message: "Cannot cancel appointment within 24 hours." }, 400);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.CoachCancelling);
      return c.json({ message: "Appointment cancellation request sent." });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
