import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getActiveSelectionForStudent } from "../../../../data/selectionDao.ts";

export function useApiStudentSelectionPending(app: Hono) {
  app.get("/api/student/selection/pending", async (c) => {
    const claim = await getClaim(c);

    try {
      const activeSelection = getActiveSelectionForStudent(claim.id);
      if (activeSelection) {
        return c.json({ selection: activeSelection.selection, coach: activeSelection.coach });
      } else {
        return c.json({ selection: null });
      }
    } catch (error) {
      console.error("Error fetching student's active selection:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
