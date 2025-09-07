import { Hono } from "hono";

export function useCoachAppointmentsCancelling(app: Hono) {
  app.get("/coach/appointments/cancelling", async (c) => {
    const cancellingAppointmentsPage = await Deno.readTextFile(
      "./static/coach/appointments/cancelling.html",
    );
    return c.html(cancellingAppointmentsPage);
  });
}
