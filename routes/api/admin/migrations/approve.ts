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

export function useApiAdminMigrationsApprove(app: Hono) {
  app.post("/api/admin/migrations/approve", async (c) => {
    const { migrationId } = await c.req.json();

    if (isNaN(migrationId)) {
      return c.json({ message: "Invalid migration ID." }, 400);
    }

    try {
      const migration = getMigrationById(migrationId);
      if (!migration) {
        return c.json({ message: "Migration not found." }, 404);
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

      if (migration.status === MigrationStatus.Rejected) {
        return c.json({ message: "Cannot approve a rejected migration." }, 400);
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "Original selection not found." }, 404);
      }

      const newCoach = getCoachById(migration.destCoachId);
      if (!newCoach) {
        return c.json({ message: "Destination coach not found." }, 404);
      }

      const newStatus = migration.status | MigrationStatus.CampusAdminApproved;
      updateMigrationStatus(migrationId, newStatus);

      if (newStatus !== MigrationStatus.Completed) {
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `Your coach change request has been approved by the campus admin.`,
          `/student/selection/all`,
          Date.now(),
        );
        return c.json({
          message:
            "Migration approved by campus admin. Awaiting further approvals.",
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
        `Your coach change request has been approved. Your new coach is ${newCoach.realName}.`,
        `/student/selection/all`,
        Date.now(),
      );

      return c.json({ message: "Migration approved successfully." });
    } catch (error) {
      console.error("Error approving migration:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
