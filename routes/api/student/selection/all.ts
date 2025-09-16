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
      console.error("获取学生活跃选择时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
