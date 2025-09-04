import { Hono } from "hono";

export function useCoachNotifications(app: Hono) {
  app.get("/coach/notifications", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/notifications.html"));
  });
}
