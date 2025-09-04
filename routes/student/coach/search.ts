import { Hono } from "hono";

export function useStudentCoachSearch(app: Hono) {
  app.get("/student/coach/search", (c) => {
    return c.html(Deno.readTextFileSync("static/student/coach/search.html"));
  });
}
