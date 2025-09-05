import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAllSelectionsForStudent } from "../../../../data/selectionDao.ts";

export function useApiStudentSelectionAll(app: Hono) {
  app.get("/api/student/selection/all", async (c) => {
    const claim = await getClaim(c);

    try {
      const activeSelections = getAllSelectionsForStudent(claim.id);
      return c.json({ selections: activeSelections });
    } catch (error) {
      console.error("Error fetching student's active selections:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
