import { Hono } from "hono";
import { getPendingMigrations } from "../../../data/migrationDao.ts";
import { getClaim } from "../../../auth/claim.ts";
import { MigrationStatus } from "../../../models/migration.ts";
import { getAdminById } from "../../../data/adminDao.ts";

export function useApiAdminMigrations(app: Hono) {
  app.get("/api/admin/migrations", async (c) => {
    const claim = await getClaim(c);

    try {
      let migrations;
      if (claim.type === "root") {
        migrations = getPendingMigrations(MigrationStatus.CampusAdminApproved);
      } else if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        migrations = getPendingMigrations(
          MigrationStatus.CampusAdminApproved,
          admin.campus,
        );
      }
      return c.json(migrations);
    } catch (error) {
      console.error("获取待处理迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
