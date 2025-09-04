import { Hono } from "hono";
import { clearClaim } from "../../auth/claim.ts";

export function useRootLogout(app: Hono) {
  app.get("/root/logout", async (c) => {
    await clearClaim(c);
    return c.redirect("/root/login");
  });
}
