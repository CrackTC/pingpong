import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getCoachById } from "../../../data/coachDao.ts";

export function useApiCoachMe(app: Hono) {
  app.get("/api/coach/me", async (c) => {
    const claim = await getClaim(c);
    if (!claim || claim.type !== "coach") {
      return c.json({ error: "未授权" }, 401);
    }
    const coach = getCoachById(claim.id);
    if (!coach) {
      return c.json({ error: "未找到教练" }, 404);
    }
    return c.json(coach);
  });
}
