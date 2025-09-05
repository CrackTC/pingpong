import { Hono } from "hono";

export function useCoachTimeslotAdd(app: Hono) {
  app.get("/coach/timeslot/add", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/timeslot/add.html"));
  });
}
