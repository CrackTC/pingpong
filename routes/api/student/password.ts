import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getStudentById, updateStudentPassword, verifyStudent } from "../../../data/studentDao.ts";
import { validatePassword } from "../../../utils.ts";

export function useApiStudentPassword(app: Hono) {
  app.post("/api/student/password", async (c) => {
    const { currentPassword, newPassword } = await c.req.json();
    const claim = await getClaim(c);

    if (!claim || claim.type !== "student") {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const student = getStudentById(claim.id);
    if (!student) {
      return c.json({ message: "Student not found" }, 404);
    }

    // Verify current password
    if (!verifyStudent(student.username, currentPassword)) {
      return c.json({ message: "Invalid current password" }, 400);
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return c.json({ message: passwordError }, 400);
    }

    try {
      updateStudentPassword(claim.id, newPassword);
      return c.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing student password:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
