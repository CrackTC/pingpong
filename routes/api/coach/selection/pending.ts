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
      console.error("Error fetching pending selections:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
