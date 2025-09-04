import { Hono } from "hono";

export function useCoachEdit(app: Hono) {
  app.get("/coach/edit", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/edit.html"));
  });
}
