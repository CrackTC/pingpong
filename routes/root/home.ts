import { Hono } from "hono";

export function useRootHome(app: Hono) {
  app.get("/root/home", async (c) => {
    const homePage = await Deno.readTextFile("./static/root/home.html");
    return c.html(homePage);
  });
}
