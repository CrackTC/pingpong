import { Hono } from "hono";

export function useStudentAppointmentAll(app: Hono) {
  app.get("/student/appointment/all", async (c) => {
    const allAppointmentsPage = await Deno.readTextFile(
      "./static/student/appointment/all.html",
    );
    return c.html(allAppointmentsPage);
  });
}
