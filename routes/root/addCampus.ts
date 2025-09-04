import { Hono } from "hono";

export function useRootAddCampus(app: Hono) {
  app.get("/root/campuses/add", async (c) => {
    const addCampusPage = await Deno.readTextFile("./static/root/addCampus.html");
    return c.html(addCampusPage);
  });
}
