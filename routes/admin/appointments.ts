import { Hono } from "hono";

export function useAdminAppointments(app: Hono) {
  app.get("/admin/appointments", async (c) => {
    const appointmentsPage = await Deno.readTextFile(
      "./static/admin/appointments.html",
    );
    return c.html(appointmentsPage);
  });
}
