import { Hono } from "hono";

export function useCoachProfile(app: Hono) {
  app.get("/coach/profile", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/profile.html"));
  });
}
