import { Hono } from "hono";

export function useCoachPassword(app: Hono) {
  app.get("/coach/password", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/password.html"));
  });
}
