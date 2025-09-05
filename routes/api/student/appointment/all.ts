import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAppointmentsByStudentId } from "../../../../data/appointmentDao.ts";

export function useApiStudentAppointmentAll(app: Hono) {
  app.get("/api/student/appointment/all", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    try {
      const appointments = getAppointmentsByStudentId(studentId);
      return c.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
