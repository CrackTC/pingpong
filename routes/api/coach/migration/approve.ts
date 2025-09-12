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

export function useApiCoachMigrationApprove(app: Hono) {
  app.post("/api/coach/migration/approve", async (c) => {
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
        return c.json({ message: "Cannot approve a rejected migration." }, 400);
      }

      const oldSelection = getSelectionById(migration.selectionId);
      if (!oldSelection) {
        return c.json({ message: "Original selection not found." }, 404);
      }

      if (
        migration.destCoachId !== claim.id && oldSelection.coachId !== claim.id
      ) {
        return c.json({ message: "Unauthorized." }, 401);
      }

      const newCoach = getCoachById(migration.destCoachId);
      if (!newCoach) {
        return c.json({ message: "Destination coach not found." }, 404);
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

      if (newStatus !== MigrationStatus.Completed) {
        addNotification(
          migration.campusId,
          NotificationTarget.Student,
          oldSelection.studentId,
          `Your coach change request has been approved by ${coachDesc}.`,
          `/student/migration/all`,
          Date.now(),
        );
        return c.json({
          message:
            `Migration approved by ${coachDesc}. Awaiting further approvals.`,
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
