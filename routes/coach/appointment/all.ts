import { Hono } from "hono";

export function useCoachAppointmentAll(app: Hono) {
  app.get("/coach/appointment/all", async (c) => {
    const allAppointmentsPage = await Deno.readTextFile(
      "./static/coach/appointment/all.html",
    );
    return c.html(allAppointmentsPage);
  });
}
