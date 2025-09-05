import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getApprovedCoachesForStudent } from "../../../../data/selectionDao.ts"; // Use the new DAO function

export function useApiStudentMeCoaches(app: Hono) {
  app.get("/api/student/me/coaches", async (c) => {
    const claim = await getClaim(c);

    if (!claim || claim.type !== "student") {
      return c.json({ message: "Unauthorized" }, 401);
    }

    try {
      const coaches = getApprovedCoachesForStudent(claim.id); // Use the new DAO function
      return c.json(coaches);
    } catch (error) {
      console.error("Error fetching student's coaches:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}