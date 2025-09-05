import { Hono } from "hono";
import { clearClaim } from "../../auth/claim.ts";

export function useAdminLogout(app: Hono) {
  app.get("/admin/logout", async (c) => {
    await clearClaim(c);
    return c.redirect("/admin/login");
  });
}
