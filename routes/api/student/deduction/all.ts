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
      console.error("获取扣费记录时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
