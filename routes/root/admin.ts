import { Hono } from "hono";

export function useRootAdmins(app: Hono) {
  app.get("/root/admin/all", async (c) => {
    const homePage = await Deno.readTextFile("./static/root/admin/all.html");
    return c.html(homePage);
  });

  app.get("/root/admin/add", async (c) => {
    const addAdminPage = await Deno.readTextFile(
      "./static/root/admin/add.html",
    );
    return c.html(addAdminPage);
  });
}
