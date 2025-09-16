import { Hono } from "hono";
import {
  getMigrationById,
  updateMigrationStatus,
} from "../../../../data/migrationDao.ts";
import { MigrationStatus } from "../../../../models/migration.ts";
import {
  addSelection,
  getSelectionById,
  updateSelectionStatus,
} from "../../../../data/selectionDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminMigrationsApprove(app: Hono) {
  app.post("/api/admin/migrations/approve", async (c) => {
    const { migrationId } = await c.req.json();

    if (isNaN(migrationId)) {
      return c.json({ message: "无效的迁移ID。" }, 400);
    }

    try {
      const migration = getMigrationById(migrationId);
      if (!migration) {
        return c.json({ message: "未找到迁移。" }, 404);
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

      if (migration.status === MigrationStatus.Rejected) {
        return c.json({ message: "无法批准已拒绝的迁移。" }, 400);
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "未找到原始选择。" }, 404);
      }

      const newCoach = getCoachById(migration.destCoachId);
      if (!newCoach) {
        return c.json({ message: "未找到目标教练。" }, 404);
      }

      const newStatus = migration.status | MigrationStatus.CampusAdminApproved;
      updateMigrationStatus(migrationId, newStatus);

      addSystemLog({
        campusId: migration.campusId,
        type: SystemLogType.MigrationApprove,
        text:
          `迁移ID ${migration.id} 已被校区管理员 ${claim.id} 批准。`,
        relatedId: migration.id,
      });

      if (newStatus !== MigrationStatus.Completed) {
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `您的教练更换请求已获校区管理员批准。`,
          `/student/migration/all`,
          Date.now(),
        );
        return c.json({
          message:
            "迁移已获校区管理员批准。等待进一步批准。",
        });
      }

      // Update old selection status to Outdated
      updateSelectionStatus(oldSelection.id, SelectionStatus.Outdated);

      // Add new selection for the new coach
      addSelection(
        oldSelection.studentId,
        migration.destCoachId,
        migration.campusId,
        SelectionStatus.Approved,
      );

      // Notify student
      addNotification(
        migration.campusId,
        NotificationTarget.Student,
        oldSelection.studentId,
        `您的教练更换请求已获批准。您的新教练是 ${newCoach.realName}。`,
        `/student/selection/all`,
        Date.now(),
      );

      addSystemLog({
        campusId: migration.campusId,
        type: SystemLogType.MigrationComplete,
        text:
          `迁移ID ${migration.id} 已完成。学生 ${oldSelection.studentId} 已迁移到教练 ${newCoach.id}。`,
        relatedId: migration.id,
      });

      return c.json({ message: "迁移成功批准。" });
    } catch (error) {
      console.error("批准迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
