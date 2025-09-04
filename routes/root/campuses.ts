import { Hono } from "hono";

export function useRootCampuses(app: Hono) {
  app.get("/root/campuses", async (c) => {
    const homePage = await Deno.readTextFile("./static/root/campuses.html");
    return c.html(homePage);
  });
}
