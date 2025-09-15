import { Hono } from "hono";
import {
  getStudentById,
  getStudentByPhoneAndCampus,
  updateStudent,
} from "../../../../data/studentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminStudentEdit(app: Hono) {
  app.post("/api/admin/student/edit/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const formData = await c.req.formData();
    const claim = await getClaim(c);

    const realName = formData.get("realName") as string;
    const sex = formData.get("sex") != "null"
      ? parseInt(formData.get("sex") as string)
      : null;
    const birthYear = formData.get("birthYear") != "null"
      ? parseInt(formData.get("birthYear") as string)
      : null;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") != "null"
      ? formData.get("email") as string
      : null;

    if (isNaN(id)) {
      return c.json({ message: "Invalid student ID." }, 400);
    }

    // Check if student exists
    const student = getStudentById(id);
    if (!student) {
      return c.json({ success: false, message: "Student not found." }, 404);
    }

    // Authorization check
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (admin?.campus !== student.campusId) {
        return c.json({ success: false, message: "Unauthorized" }, 401);
      }
    }

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "Phone must be 11 digits." }, 400);
    }

    // Check if phone number already exists in the same campus for another student
    const existingStudentByPhone = getStudentByPhoneAndCampus(
      phone,
      student.campusId,
      id,
    );
    if (existingStudentByPhone) {
      return c.json(
        {
          success: false,
          message: "Phone number already registered in this campus.",
        },
        409,
      );
    }

    try {
      updateStudent(id, {
        realName,
        sex,
        birthYear,
        phone,
        email,
      });

      addNotification(
        student.campusId,
        NotificationTarget.Student,
        id,
        "Your profile has been updated by an administrator.",
        "/student/profile",
        Date.now(),
      );

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentUpdate,
        text:
          `Admin ${claim.id} updated student profile: ${student.realName} (ID: ${student.id})`,
        relatedId: id,
      });

      return c.json({ message: "Student profile updated successfully" });
    } catch (error) {
      console.error("Error updating student profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
