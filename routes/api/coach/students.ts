import { Hono } from "hono";
import { getStudentsByCoachId } from "../../../data/selectionDao.ts";
import { getClaim } from "../../../auth/claim.ts";

export function useApiCoachStudents(app: Hono) {
  app.get("/api/coach/students", async (c) => {
    const claim = await getClaim(c); // Get claim from middleware
    const students = getStudentsByCoachId(claim.id);
    return c.json(students);
  });
}
