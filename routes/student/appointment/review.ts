import { Hono } from "hono";

export function useStudentAppointmentReview(app: Hono) {
  app.get("/student/appointment/review/:appointmentId", async (c) => {
    const reviewPage = await Deno.readTextFile(
      "./static/student/appointment/review.html",
    );
    return c.html(reviewPage);
  });
}
