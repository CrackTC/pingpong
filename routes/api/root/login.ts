import { Hono } from "hono";
import { verifyRoot } from "../../../data/rootDao.ts";
import { Claim, setClaim } from "../../../auth/claim.ts";

export function useApiRootLogin(app: Hono) {
  app.post("/api/root/login", async (c) => {
    const { username, password } = await c.req.json();

    const id = verifyRoot(username, password);
    if (id) {
      const claim: Claim = {
        type: "root",
        id: id,
      };
      await setClaim(c, claim);
      return c.json({ success: true, redirect: "/root/home" });
    } else {
      return c.json({ success: false, message: "Invalid username or password." }, 401);
    }
  });
}
