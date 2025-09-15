import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getEnrichedDeductionsByStudentId } from "../../../../data/deductionDao.ts";

export function useApiStudentDeductionAll(app: Hono) {
  app.get("/api/student/deduction/all", async (c) => {
    const claim = await getClaim(c);

    try {
      const deductions = getEnrichedDeductionsByStudentId(claim.id);
      return c.json(deductions);
    } catch (error) {
      console.error("Error fetching deduction records:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
