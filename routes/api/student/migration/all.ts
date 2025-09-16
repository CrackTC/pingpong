import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getMigrationsByStudentId } from "../../../../data/migrationDao.ts";

export function useApiStudentMigrationAll(app: Hono) {
  app.get("/api/student/migration/all", async (c) => {
    const claim = await getClaim(c);

    try {
      const migrations = getMigrationsByStudentId(claim.id, false);
      return c.json(migrations);
    } catch (error) {
      console.error("获取学生迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
