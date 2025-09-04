import { Hono } from "hono";

export function useStudentSelectionPending(app: Hono) {
  app.get("/student/selection/pending", (c) => {
    return c.html(Deno.readTextFileSync("static/student/selection/pending.html"));
  });
}
