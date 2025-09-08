import { Hono } from "hono";

export function useCoachAppointmentCancelling(app: Hono) {
  app.get("/coach/appointment/cancelling", async (c) => {
    const cancellingAppointmentsPage = await Deno.readTextFile(
      "./static/coach/appointment/cancelling.html",
    );
    return c.html(cancellingAppointmentsPage);
  });
}
