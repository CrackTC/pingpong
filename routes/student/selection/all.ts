import { Hono } from "hono";

export function useStudentSelectionAll(app: Hono) {
  app.get("/student/selection/all", (c) => {
    return c.html(Deno.readTextFileSync("static/student/selection/all.html"));
  });
}
