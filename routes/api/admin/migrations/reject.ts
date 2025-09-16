import { Hono } from "hono";
import {
  getMigrationById,
  updateMigrationStatus,
} from "../../../../data/migrationDao.ts";
import { MigrationStatus } from "../../../../models/migration.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getSelectionById } from "../../../../data/selectionDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminMigrationsReject(app: Hono) {
  app.post("/api/admin/migrations/reject", async (c) => {
    const { migrationId } = await c.req.json();

    if (isNaN(migrationId)) {
      return c.json({ message: "无效的迁移ID。" }, 400);
    }

    try {
      const migration = getMigrationById(migrationId);
      if (!migration) {
        return c.json({ message: "未找到迁移。" }, 404);
      }

      if (migration.status === MigrationStatus.Rejected) {
        return c.json({ message: "迁移已被拒绝。" }, 400);
      }

      if ((migration.status & MigrationStatus.CampusAdminApproved) !== 0) {
        return c.json({
          message: "无法拒绝已被校区管理员批准的迁移。",
        }, 400);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        if (admin.campus !== migration.campusId) {
          return c.json(
            { message: "管理员无权管理此校区。" },
            403,
          );
        }
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "未找到原始选择。" }, 404);
      }

      // Update migration status to Rejected
      updateMigrationStatus(migrationId, MigrationStatus.Rejected);

      // Notify student
      addNotification(
        migration.campusId,
        NotificationTarget.Student,
        oldSelection.studentId, // Assuming oldSelection is available
        `您的教练更换请求已被管理员拒绝。`,
        `/student/migration/all`,
        Date.now(),
      );

      addSystemLog({
        campusId: migration.campusId,
        type: SystemLogType.MigrationReject,
        text: `迁移ID ${migration.id} 已被管理员 ${claim.id} 拒绝。`,
        relatedId: migration.id,
      });

      return c.json({ message: "迁移成功拒绝。" });
    } catch (error) {
      console.error("拒绝迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
