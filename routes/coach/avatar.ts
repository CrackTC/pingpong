import { Hono } from "hono";

export function useCoachAvatar(app: Hono) {
  app.get("/coach/avatar", (c) => {
    return c.html(Deno.readTextFileSync("static/coach/avatar.html"));
  });
}
