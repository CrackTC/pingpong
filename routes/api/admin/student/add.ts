import { Hono } from "hono";
import { addStudent, getStudentByUsername, getStudentByPhoneAndCampus } from "../../../../data/studentDao.ts";
import { getCampusById } from "../../../../data/campusDao.ts";
import { Sex } from "../../../../models/sex.ts";
import { validatePassword } from "../../../../utils.ts";

export function useApiAdminStudentAdd(app: Hono) {
  app.post("/api/admin/student/add", async (c) => {
    const {
      username,
      password,
      realName,
      sex,
      birthYear,
      campusId,
      phone,
      email,
    } = await c.req.json();

    // Basic validation
    if (!username || typeof username !== "string" || username.trim() === "") {
      return c.json({ success: false, message: "Username is required." }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return c.json({ success: false, message: passwordError }, 400);
    }

    if (!realName || typeof realName !== "string" || realName.trim() === "") {
      return c.json({ success: false, message: "Real Name is required." }, 400);
    }
    if (
      sex !== null &&
      sex !== undefined &&
      (typeof sex !== "number" || !(sex in Sex))
    ) {
      return c.json(
        {
          success: false,
          message: "Valid Sex is required if provided.",
        },
        400,
      );
    }
    if (
      birthYear !== null &&
      birthYear !== undefined &&
      (typeof birthYear !== "number" ||
        birthYear < 1900 ||
        birthYear > new Date().getFullYear())
    ) {
      return c.json(
        {
          success: false,
          message: "Valid Birth Year is required if provided.",
        },
        400,
      );
    }
    if (isNaN(campusId)) {
      return c.json({ success: false, message: "Campus is required." }, 400);
    }
    if (!phone || !/^\d{11}$/.test(phone)) {
      return c.json(
        { success: false, message: "Phone must be 11 digits." },
        400,
      );
    }

    // Check if username already exists
    const existingStudent = getStudentByUsername(username);
    if (existingStudent) {
      return c.json(
        { success: false, message: "Username already exists." },
        409,
      );
    }

    // Check if phone number already exists in the same campus
    const existingStudentByPhone = getStudentByPhoneAndCampus(phone, campusId);
    if (existingStudentByPhone) {
        return c.json(
            { success: false, message: "Phone number already registered in this campus." },
            409,
        );
    }

    // Check if campusId is valid
    const campus = getCampusById(campusId);
    if (!campus) {
      return c.json({ success: false, message: "Invalid Campus ID." }, 400);
    }

    try {
      addStudent({
        username,
        password,
        realName,
        sex,
        birthYear,
        campusId,
        phone,
        email: email || null,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("Error adding student:", error);
      return c.json(
        { success: false, message: "An unexpected error occurred." },
        500,
      );
    }
  });
}
