import { Hono } from "hono";

export function useCoachHome(app: Hono) {
  app.get("/coach/home", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/home.html"));
  });
}
