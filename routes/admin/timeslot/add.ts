import { Hono } from "hono";

export function useAdminTimeslotAdd(app: Hono) {
  app.get("/admin/timeslot/add", (c) => {
    return c.html(Deno.readTextFileSync("static/admin/timeslot/add.html"));
  });
}
