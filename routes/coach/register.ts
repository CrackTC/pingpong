import { Hono } from "hono";

export function useCoachRegister(app: Hono) {
  app.get("/coach/register", async (c) => {
    const registerPage = await Deno.readTextFile(
      "./static/coach/register.html",
    );
    return c.html(registerPage);
  });
}
