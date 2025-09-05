import { Hono } from "hono";

export function useAdminTimeslotAll(app: Hono) {
  app.get("/admin/timeslot/all", (c) => {
    return c.html(Deno.readTextFileSync("static/admin/timeslot/all.html"));
  });
}
