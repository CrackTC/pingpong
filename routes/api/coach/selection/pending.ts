import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getPendingSelectionsForCoach } from "../../../../data/selectionDao.ts";

export function useApiCoachSelectionPending(app: Hono) {
  app.get("/api/coach/selection/pending", async (c) => {
    const claim = await getClaim(c);

    try {
      const pendingSelections = getPendingSelectionsForCoach(claim.id);
      return c.json(pendingSelections);
    } catch (error) {
      console.error("获取待处理选择时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
