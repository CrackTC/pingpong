import { Hono } from "hono";

export function useStudentPassword(app: Hono) {
  app.get("/student/password", (c) => {
    return c.html(Deno.readTextFileSync("static/student/password.html"));
  });
}
