import { Hono } from "hono";
import { clearClaim } from "../../auth/claim.ts";

export function useCoachLogout(app: Hono) {
  app.get("/coach/logout", async (c) => {
    await clearClaim(c);
    return c.redirect("/coach/login");
  });
}
