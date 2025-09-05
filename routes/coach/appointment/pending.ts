import { Hono } from "hono";

export function useCoachAppointmentPending(app: Hono) {
  app.get("/coach/appointment/pending", async (c) => {
    const pendingAppointmentsPage = await Deno.readTextFile(
      "./static/coach/appointment/pending.html",
    );
    return c.html(pendingAppointmentsPage);
  });
}
