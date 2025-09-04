import { Hono } from "hono";

export function useRootCampuses(app: Hono) {
  app.get("/root/campus/all", async (c) => {
    return c.html(await Deno.readTextFile("./static/root/campus/all.html"));
  });

  app.get("/root/campus/add", async (c) => {
    return c.html(await Deno.readTextFile("./static/root/campus/add.html"));
  });
}
