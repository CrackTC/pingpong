import { Hono } from "hono";

export function useStudentNotifications(app: Hono) {
  app.get("/student/notifications", (c) => {
    return c.html(Deno.readTextFileSync("static/student/notifications.html"));
  });
}
