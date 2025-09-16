import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getPendingMigrationsForCoach } from "../../../../data/migrationDao.ts";

export function useApiCoachMigrationPending(app: Hono) {
  app.get("/api/coach/migration/pending", async (c) => {
    const claim = await getClaim(c);

    try {
      const migrations = getPendingMigrationsForCoach(claim.id);
      return c.json(migrations);
    } catch (error) {
      console.error("获取待处理教练迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
