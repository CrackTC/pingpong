import { Hono } from "hono";

export function useCoachTimeslotAll(app: Hono) {
  app.get("/coach/timeslot/all", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/timeslot/all.html"));
  });
}
