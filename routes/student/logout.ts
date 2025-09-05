import { Hono } from "hono";
import { clearClaim } from "../../auth/claim.ts";

export function useStudentLogout(app: Hono) {
  app.get("/student/logout", async (c) => {
    await clearClaim(c);
    return c.redirect("/student/login");
  });
}
