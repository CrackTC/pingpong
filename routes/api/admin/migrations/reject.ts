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

      if ((migration.status & MigrationStatus.CampusAdminApproved) !== 0) {
        return c.json({
          message:
            "Cannot reject a migration that has been approved by campus admin.",
        }, 400);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }
        if (admin.campus !== migration.campusId) {
          return c.json(
            { message: "Admin not authorized for this campus." },
            403,
          );
        }
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "Original selection not found." }, 404);
      }

      // Update migration status to Rejected
      updateMigrationStatus(migrationId, MigrationStatus.Rejected);

      // Notify student
      addNotification(
        migration.campusId,
        NotificationTarget.Student,
        oldSelection.studentId, // Assuming oldSelection is available
        `Your coach change request has been rejected by admin.`,
        `/student/migration/all`,
        Date.now(),
      );

      addSystemLog({
        campusId: migration.campusId,
        type: SystemLogType.MigrationReject,
        text: `Migration ID ${migration.id} rejected by admin ${claim.id}.`,
        relatedId: migration.id,
      });

      return c.json({ message: "Migration rejected successfully." });
    } catch (error) {
      console.error("Error rejecting migration:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
