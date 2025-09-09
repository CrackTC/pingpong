import { Hono } from "hono";
import { searchStudentsByPhone } from "../../../../data/studentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";

export function useApiAdminStudentSearch(app: Hono) {
  app.post("/api/admin/student/search", async (c) => {
    const { phone } = await c.req.json();
    const claim = await getClaim(c);

    if (!phone) {
      return c.json({ message: "Search query is required." }, 400);
    }

    try {
      let students;
      if (claim.type === "root") {
        students = searchStudentsByPhone(phone);
      } else if (claim.type === "admin") {
        students = searchStudentsByPhone(phone, claim.campusId);
      } else {
        return c.json({ message: "Unauthorized" }, 401);
      }
      return c.json(students);
    } catch (error) {
      console.error("Error searching students:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
