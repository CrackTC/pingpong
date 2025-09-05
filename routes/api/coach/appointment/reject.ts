import { Hono } from "hono";
import { updateAppointmentStatus } from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";

export function useApiCoachAppointmentReject(app: Hono) {
  app.post("/api/coach/appointment/reject", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      updateAppointmentStatus(appointmentId, AppointmentStatus.Rejected);
      return c.json({ message: "Appointment rejected successfully." });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
