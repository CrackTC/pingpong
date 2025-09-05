import { Hono } from "hono";

export function useStudentAppointmentSearch(app: Hono) {
  app.get("/student/appointment/search", async (c) => {
    const searchPage = await Deno.readTextFile(
      "./static/student/appointment/search.html",
    );
    return c.html(searchPage);
  });
}