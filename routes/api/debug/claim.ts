import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";

export function useApiDebugClaim(app: Hono) {
  app.get("/api/debug/claim", async (c) => {
    const claim = await getClaim(c);
    return c.json(claim);
  });
}
