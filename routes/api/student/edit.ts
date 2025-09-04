import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { updateStudent } from "../../../data/studentDao.ts";

export function useApiStudentEdit(app: Hono) {
  app.post("/api/student/edit", async (c) => {
    const { realName, sex, birthYear, phone, email } = await c.req.json();
    const claim = await getClaim(c);

    try {
      updateStudent(claim.id, { realName, sex, birthYear, phone, email });
      return c.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating student profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
