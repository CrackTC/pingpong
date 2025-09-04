import { Hono } from "hono";

export function useRootAdmins(app: Hono) {
  app.get("/root/admins", async (c) => {
    const homePage = await Deno.readTextFile("./static/root/admins.html");
    return c.html(homePage);
  });

  app.get("/root/admins/add", async (c) => {
    const addAdminPage = await Deno.readTextFile("./static/root/addAdmin.html");
    return c.html(addAdminPage);
  });
}
