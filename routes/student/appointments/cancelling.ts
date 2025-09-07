import { Hono } from "hono";

export function useStudentAppointmentsCancelling(app: Hono) {
  app.get("/student/appointments/cancelling", async (c) => {
    const cancellingAppointmentsPage = await Deno.readTextFile(
      "./static/student/appointments/cancelling.html",
    );
    return c.html(cancellingAppointmentsPage);
  });
}
