import { Hono } from "hono";

export function useRootLogin(app: Hono) {
  app.get("/root/login", async (c) => {
    const loginPage = await Deno.readTextFile(
      "./static/root/login.html",
    );
    return c.html(loginPage);
  });
}
