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
      return c.json({ message: "Invalid migration ID." }, 400);
    }

    try {
      const migration = getMigrationById(migrationId);
      if (!migration) {
        return c.json({ message: "Migration not found." }, 404);
      }

      if (migration.status === MigrationStatus.Rejected) {
        return c.json({ message: "Migration already rejected." }, 400);
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "Original selection not found." }, 404);
      }

      if (migration.destCoachId === claim.id) {
        if ((migration.status & MigrationStatus.DestCoachApproved) !== 0) {
          return c.json({
            message:
              "Cannot reject a migration that has been approved by the destination coach.",
          }, 400);
        }
        updateMigrationStatus(migrationId, MigrationStatus.Rejected);
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `Your migration request has been rejected by the destination coach.`,
          `/student/migration/all`,
          Date.now(),
        );

        addSystemLog({
          campusId: migration.campusId,
          type: SystemLogType.MigrationReject,
          text:
            `Destination coach (ID: ${claim.id}) rejected migration (ID: ${migrationId}) for student (ID: ${oldSelection.studentId}).`,
          relatedId: migrationId,
        });
      } else {
        if (oldSelection.coachId !== claim.id) {
          return c.json({ message: "Unauthorized." }, 401);
        }
        if ((migration.status & MigrationStatus.OriginCoachApproved) !== 0) {
          return c.json({
            message:
              "Cannot reject a migration that has been approved by the origin coach.",
          }, 400);
        }
        updateMigrationStatus(migrationId, MigrationStatus.Rejected);
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `Your migration request has been rejected by the origin coach.`,
          `/student/migration/all`,
          Date.now(),
        );

        addSystemLog({
          campusId: migration.campusId,
          type: SystemLogType.MigrationReject,
          text:
            `Origin coach (ID: ${claim.id}) rejected migration (ID: ${migrationId}) for student (ID: ${oldSelection.studentId}).`,
          relatedId: migrationId,
        });
      }

      return c.json({ message: "Migration rejected successfully." });
    } catch (error) {
      console.error("Error rejecting migration:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
