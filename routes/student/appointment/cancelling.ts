import { Hono } from "hono";

export function useStudentAppointmentCancelling(app: Hono) {
  app.get("/student/appointment/cancelling", async (c) => {
    const cancellingAppointmentsPage = await Deno.readTextFile(
      "./static/student/appointment/cancelling.html",
    );
    return c.html(cancellingAppointmentsPage);
  });
}
