import { Hono } from "hono";
import { getPendingCoaches } from "../../../../data/coachDao.ts";

export function useApiGetCoaches(app: Hono) {
  app.get("/api/admin/coach/pending", (c) => {
    const pendingCoaches = getPendingCoaches();
    return c.json(pendingCoaches);
  });
}
