import { Hono } from "hono";

export function useAdminLogin(app: Hono) {
  app.get("/admin/login", async (c) => {
    const loginPage = await Deno.readTextFile(
      "./static/admin/login.html",
    );
    return c.html(loginPage);
  });
}
