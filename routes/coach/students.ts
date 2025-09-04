import { Hono } from "hono";

export function useCoachStudents(app: Hono) {
  app.get("/coach/students", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/students.html"));
  });
}
