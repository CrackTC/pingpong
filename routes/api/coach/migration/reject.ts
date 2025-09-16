import { Hono } from "hono";
import {
  getMigrationById,
  updateMigrationStatus,
} from "../../../../data/migrationDao.ts";
import { MigrationStatus } from "../../../../models/migration.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getSelectionById } from "../../../../data/selectionDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachMigrationReject(app: Hono) {
  app.post("/api/coach/migration/reject", async (c) => {
    const { migrationId } = await c.req.json();
    const claim = await getClaim(c);

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

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "未找到原始选择。" }, 404);
      }

      if (migration.destCoachId === claim.id) {
        if ((migration.status & MigrationStatus.DestCoachApproved) !== 0) {
          return c.json({
            message: "无法拒绝已被目标教练批准的迁移。",
          }, 400);
        }
        updateMigrationStatus(migrationId, MigrationStatus.Rejected);
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `您的迁移请求已被目标教练拒绝。`,
          `/student/migration/all`,
          Date.now(),
        );

        addSystemLog({
          campusId: migration.campusId,
          type: SystemLogType.MigrationReject,
          text:
            `目标教练 (ID: ${claim.id}) 拒绝了学生 (ID: ${oldSelection.studentId}) 的迁移 (ID: ${migrationId})。`,
          relatedId: migrationId,
        });
      } else {
        if (oldSelection.coachId !== claim.id) {
          return c.json({ message: "未授权。" }, 401);
        }
        if ((migration.status & MigrationStatus.OriginCoachApproved) !== 0) {
          return c.json({
            message: "无法拒绝已被原始教练批准的迁移。",
          }, 400);
        }
        updateMigrationStatus(migrationId, MigrationStatus.Rejected);
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `您的迁移请求已被原始教练拒绝。`,
          `/student/migration/all`,
          Date.now(),
        );

        addSystemLog({
          campusId: migration.campusId,
          type: SystemLogType.MigrationReject,
          text:
            `原始教练 (ID: ${claim.id}) 拒绝了学生 (ID: ${oldSelection.studentId}) 的迁移 (ID: ${migrationId})。`,
          relatedId: migrationId,
        });
      }

      return c.json({ message: "迁移成功拒绝。" });
    } catch (error) {
      console.error("拒绝迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
