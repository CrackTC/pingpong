import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { updateSelectionStatus, getSelectionById, getSelectionCountForCoach } from "../../../../data/selectionDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { SelectionStatus } from "../../../../models/selection.ts";
import { getCoachById } from "../../../../data/coachDao.ts"; // Import getCoachById

export function useApiCoachSelectionApprove(app: Hono) {
  app.post("/api/coach/selection/approve", async (c) => {
    const { selectionId } = await c.req.json();
    const claim = await getClaim(c);

    const selection = getSelectionById(selectionId);

    if (!selection) {
      return c.json({ message: "Selection not found" }, 404);
    }

    if (selection.coachId !== claim.id) {
      return c.json({ message: "Unauthorized to approve this selection" }, 403);
    }

    const MAX_STUDENTS = 20;
    const approvedStudentCount = getSelectionCountForCoach(claim.id);
    if (approvedStudentCount >= MAX_STUDENTS) {
        return c.json({ message: `Coach has reached the maximum limit of ${MAX_STUDENTS} approved students.` }, 400);
    }

    const coach = getCoachById(selection.coachId); // Get coach details
    if (!coach) {
        return c.json({ message: "Coach not found" }, 404);
    }

    try {
      updateSelectionStatus(selectionId, SelectionStatus.Approved);
      addNotification(
        selection.campusId,
        NotificationTarget.Student,
        selection.studentId,
        `Your coach selection request for ${coach.realName} has been approved!`, // Use coach.realName
        `/student/profile`, // Link to student's profile
        Date.now()
      );
      return c.json({ message: "Selection approved successfully" });
    } catch (error) {
      console.error("Error approving selection:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
