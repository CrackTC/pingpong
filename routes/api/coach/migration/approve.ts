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
import { getClaim } from "../../../../auth/claim.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachMigrationApprove(app: Hono) {
  app.post("/api/coach/migration/approve", async (c) => {
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
        return c.json({ message: "无法批准已拒绝的迁移。" }, 400);
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "未找到原始选择。" }, 404);
      }

      if (
        migration.destCoachId !== claim.id && oldSelection.coachId !== claim.id
      ) {
        return c.json({ message: "未授权。" }, 401);
      }

      const newCoach = getCoachById(migration.destCoachId);
      if (!newCoach) {
        return c.json({ message: "未找到目标教练。" }, 404);
      }

      let newStatus = migration.status;
      let coachDesc;
      if (migration.destCoachId === claim.id) {
        newStatus |= MigrationStatus.DestCoachApproved;
        coachDesc = "destination coach";
      } else {
        newStatus |= MigrationStatus.OriginCoachApproved;
        coachDesc = "original coach";
      }

      updateMigrationStatus(migrationId, newStatus);

      addSystemLog({
        campusId: migration.campusId,
        type: SystemLogType.MigrationApprove,
        text:
          `迁移ID ${migration.id} 已被 ${coachDesc} (教练ID ${claim.id}) 批准。`,
        relatedId: migration.id,
      });

      if (newStatus !== MigrationStatus.Completed) {
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `您的教练更换请求已被 ${coachDesc} 批准。`,
          `/student/migration/all`,
          Date.now(),
        );
        return c.json({
          message:
            `迁移已被 ${coachDesc} 批准。等待进一步批准。`,
        });
      }

      updateSelectionStatus(oldSelection.id, SelectionStatus.Outdated);

      addSelection(
        oldSelection.studentId,
        migration.destCoachId,
        migration.campusId,
        SelectionStatus.Approved,
      );

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
          `迁移ID ${migration.id} 已完成。学生ID ${oldSelection.studentId} 已从教练ID ${oldSelection.coachId} 迁移到教练ID ${migration.destCoachId}。`,
        relatedId: migration.id,
      });

      return c.json({ message: "迁移成功批准。" });
    } catch (error) {
      console.error("批准迁移时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
