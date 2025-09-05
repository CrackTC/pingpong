import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { updateSelectionStatus, getSelectionById } from "../../../../data/selectionDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { getCoachById } from "../../../../data/coachDao.ts";

export function useApiCoachSelectionReject(app: Hono) {
  app.post("/api/coach/selection/reject", async (c) => {
    const { selectionId } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim || claim.type !== "coach") {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const selection = getSelectionById(selectionId);

    if (!selection) {
      return c.json({ message: "Selection not found" }, 404);
    }

    if (selection.coachId !== claim.id) {
      return c.json({ message: "Unauthorized to reject this selection" }, 403);
    }

    const coach = getCoachById(selection.coachId);
    if (!coach) {
        return c.json({ message: "Coach not found" }, 404);
    }

    try {
      updateSelectionStatus(selectionId, SelectionStatus.Rejected);
      addNotification(
        selection.campusId,
        NotificationTarget.Student,
        selection.studentId,
        `Your coach selection request for ${coach.realName} has been rejected.`, // Use coach.realName
        `/student/selection/all`, // Link to student's profile
        Date.now()
      );
      return c.json({ message: "Selection rejected successfully" });
    } catch (error) {
      console.error("Error rejecting selection:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
