import { Hono } from "hono";

export function useCoachSelectionPending(app: Hono) {
  app.get("/coach/selection/pending", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/selection/pending.html"));
  });
}
