import { Hono } from "hono";

export function useCoachLogin(app: Hono) {
  app.get("/coach/login", async (c) => {
    const loginPage = await Deno.readTextFile(
      "./static/coach/login.html",
    );
    return c.html(loginPage);
  });
}
