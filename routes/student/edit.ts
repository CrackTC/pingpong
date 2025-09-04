import { Hono } from "hono";

export function useStudentEdit(app: Hono) {
  app.get("/student/edit", (c) => {
    return c.html(Deno.readTextFileSync("static/student/edit.html"));
  });
}
