import { Hono } from "hono";
import { updateAppointmentStatus } from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";

export function useApiCoachAppointmentApprove(app: Hono) {
  app.post("/api/coach/appointment/approve", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      updateAppointmentStatus(appointmentId, AppointmentStatus.Approved);
      return c.json({ message: "Appointment approved successfully." });
    } catch (error) {
      console.error("Error approving appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
