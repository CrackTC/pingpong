import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import {
  getStudentById,
  getStudentByPhoneAndCampus,
  updateStudent,
} from "../../../data/studentDao.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiStudentEdit(app: Hono) {
  app.post("/api/student/edit", async (c) => {
    const { realName, sex, birthYear, phone, email } = await c.req.json();
    const claim = await getClaim(c);

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "Phone must be 11 digits." }, 400);
    }

    if (!claim || !claim.id) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const currentStudent = getStudentById(claim.id);
    if (!currentStudent) {
      return c.json({ message: "Student not found" }, 404);
    }

    // Check for duplicate phone number within the same campus, excluding the current student
    if (phone && phone !== currentStudent.phone) { // Only check if phone is provided and changed
      const existingStudentWithPhone = getStudentByPhoneAndCampus(
        phone,
        currentStudent.campusId,
        currentStudent.id,
      );
      if (existingStudentWithPhone) {
        return c.json({
          message: "Phone number already registered in this campus.",
        }, 409);
      }
    }

    try {
      updateStudent(claim.id, { realName, sex, birthYear, phone, email });
      addSystemLog({
        campusId: currentStudent.campusId,
        type: SystemLogType.StudentUpdate,
        text:
          `Student ${currentStudent.realName} (ID: ${currentStudent.id}) updated their profile.`,
        relatedId: currentStudent.id,
      });
      return c.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating student profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
