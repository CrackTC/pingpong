import { Hono } from "hono";

export function useStudentHome(app: Hono) {
  app.get("/student/home", (c) => {
    return c.html(Deno.readTextFileSync("static/student/home.html"));
  });
}
