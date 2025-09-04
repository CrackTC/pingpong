import { Hono } from "hono";

export function useStudentProfile(app: Hono) {
  app.get("/student/profile", (c) => {
    return c.html(Deno.readTextFileSync("static/student/profile.html"));
  });
}
