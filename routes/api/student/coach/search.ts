import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { searchCoaches } from "../../../../data/coachDao.ts";
import { getStudentById } from "../../../../data/studentDao.ts";

export function useApiStudentCoachSearch(app: Hono) {
  app.get("/api/student/coach/search", async (c) => {
    const claim = await getClaim(c);

    if (!claim || claim.type !== "student") {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const student = getStudentById(claim.id);
    if (!student) {
      return c.json({ message: "Student not found" }, 404);
    }

    const realName = c.req.query("realName");
    const sex = c.req.query("sex");
    const age = c.req.query("age");

    let birthYear: number | undefined;
    if (age) {
      const currentYear = new Date().getFullYear();
      birthYear = currentYear - parseInt(age);
    }

    try {
      const coaches = searchCoaches(
        student.campusId,
        realName,
        sex ? parseInt(sex) : undefined,
        birthYear,
      );
      return c.json(coaches);
    } catch (error) {
      console.error("Error searching coaches:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
