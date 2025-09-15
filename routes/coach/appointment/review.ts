import { Hono } from "hono";

export function useCoachAppointmentReview(app: Hono) {
  app.get("/coach/appointment/review/:appointmentId", async (c) => {
    const reviewPage = await Deno.readTextFile(
      "./static/coach/appointment/review.html",
    );
    return c.html(reviewPage);
  });
}
