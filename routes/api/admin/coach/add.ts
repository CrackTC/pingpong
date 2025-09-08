import { Hono } from "hono";
import {
  addCoach,
  getCoachByUsername,
  searchCoachesByIdCardOrPhone,
} from "../../../../data/coachDao.ts";
import { getCampusById } from "../../../../data/campusDao.ts";
import { Sex } from "../../../../models/sex.ts";
import { validatePassword } from "../../../../utils.ts";

export function useApiAdminCoachAdd(app: Hono) {
  app.post("/api/admin/coach/add", async (c) => {
    const formData = await c.req.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const realName = formData.get("realName") as string;
    const sex = formData.get("sex")
      ? parseInt(formData.get("sex") as string)
      : null;
    const birthYear = formData.get("birthYear")
      ? parseInt(formData.get("birthYear") as string)
      : null;
    const campusId = parseInt(formData.get("campusId") as string);
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const idCardNumber = formData.get("idCardNumber") as string;
    const comment = formData.get("comment") as string;
    const avatarFile = formData.get("avatar") as File;

    // Basic validation
    if (!username || typeof username !== "string" || username.trim() === "") {
      return c.json({ success: false, message: "Username is required." }, 400);
    }

    if (!password || password.trim() === "") {
      return c.json({ success: false, message: "Password is required." }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return c.json({ success: false, message: passwordError }, 400);
    }

    if (!realName || typeof realName !== "string" || realName.trim() === "") {
      return c.json({ success: false, message: "Real Name is required." }, 400);
    }
    if (
      sex !== null && sex !== undefined &&
      (typeof sex !== "number" || !(sex in Sex))
    ) {
      return c.json({
        success: false,
        message: "Valid Sex is required if provided.",
      }, 400);
    }
    if (
      birthYear !== null && birthYear !== undefined &&
      (typeof birthYear !== "number" || birthYear < 1900 ||
        birthYear > new Date().getFullYear())
    ) {
      return c.json({
        success: false,
        message: "Valid Birth Year is required if provided.",
      }, 400);
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
    if (!idCardNumber || !/^\d{18}$/.test(idCardNumber)) {
      return c.json({
        success: false,
        message: "ID card number must be 18 digits.",
      }, 400);
    }

    // Check if username already exists
    const existingCoach = getCoachByUsername(username);
    if (existingCoach) {
      return c.json(
        { success: false, message: "Username already exists." },
        409,
      );
    }

    // Check if phone or ID card number already exists
    let existingCoachByPhoneOrIdCard = searchCoachesByIdCardOrPhone(phone, campusId)
    if (existingCoachByPhoneOrIdCard.length == 0) {
      existingCoachByPhoneOrIdCard = searchCoachesByIdCardOrPhone(idCardNumber, campusId)
    }
    if (existingCoachByPhoneOrIdCard.length > 0) {
      return c.json(
        {
          success: false,
          message: "Phone number or ID card number already registered.",
        },
        409,
      );
    }

    // Check if campusId is valid
    const campus = getCampusById(campusId);
    if (!campus) {
      return c.json({ success: false, message: "Invalid Campus ID." }, 400);
    }

    let avatarPath: string = "";
    if (avatarFile && avatarFile.size > 0) {
      const uploadsDir = "static/avatars/coaches";
      await Deno.mkdir(uploadsDir, { recursive: true });
      const filename = `${crypto.randomUUID()}-${avatarFile.name}`;
      avatarPath = `/${uploadsDir}/${filename}`;
      await Deno.writeFile(
        `./${uploadsDir}/${filename}`,
        new Uint8Array(await avatarFile.arrayBuffer()),
      );
    }

    try {
      addCoach({
        username,
        password,
        realName,
        sex,
        birthYear,
        campusId,
        phone,
        email: email || null,
        idCardNumber: idCardNumber,
        avatarPath: avatarPath,
        comment: comment,
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("Error adding coach:", error);
      return c.json({
        success: false,
        message: "An unexpected error occurred.",
      }, 500);
    }
  });
}
