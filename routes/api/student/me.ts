import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getStudentById } from "../../../data/studentDao.ts";

export function useApiStudentMe(app: Hono) {
  app.get("/api/student/me", async (c) => {
    const claim = await getClaim(c);
    if (!claim || claim.type !== "student") {
      return c.json({ error: "未授权" }, 401);
    }
    const student = getStudentById(claim.id);
    if (!student) {
      return c.json({ error: "未找到学生" }, 404);
    }
    return c.json(student);
  });
}
