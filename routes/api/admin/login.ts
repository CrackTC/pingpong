import { Hono } from "hono";
import { verifyAdmin } from "../../../data/adminDao.ts";
import { Claim, setClaim } from "../../../auth/claim.ts";

export function useApiAdminLogin(app: Hono) {
  app.post("/api/admin/login", async (c) => {
    const { username, password } = await c.req.json();

    const id = verifyAdmin(username, password);
    if (id) {
      const claim: Claim = {
        type: "admin",
        id: id,
      };
      await setClaim(c, claim);
      return c.json({ success: true, redirect: "/admin/home" }); // Assuming /admin/home exists
    } else {
      return c.json({ success: false, message: "Invalid username or password." }, 401);
    }
  });
}
