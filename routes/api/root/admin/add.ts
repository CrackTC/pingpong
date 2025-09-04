import { Hono } from "hono";
import { addAdmin, getAdminByUsername } from "../../../../data/adminDao.ts";
import { getCampusById } from "../../../../data/campusDao.ts";
import { validatePassword } from "../../../../utils.ts";

export function useApiAddAdmin(app: Hono) {
  app.post("/api/root/admin/add", async (c) => {
    const { username, password, campusId } = await c.req.json();

    if (!username || typeof username !== "string" || username.trim() === "") {
      return c.json({ success: false, message: "Username is required." }, 400);
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
      return c.json({ success: false, message: "Password is required." }, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return c.json({ success: false, message: passwordError }, 400);
    }

    if (!campusId || typeof campusId !== "number") {
      return c.json({
        success: false,
        message: "Campus ID is required and must be a number.",
      }, 400);
    }

    const campus = getCampusById(campusId);
    if (!campus) {
      return c.json({ success: false, message: "Campus not found." }, 400);
    }

    const existingAdmin = getAdminByUsername(username);
    if (existingAdmin) {
      return c.json({
        success: false,
        message: "Admin with this username already exists.",
      }, 409);
    }

    try {
      addAdmin(username, password, campusId);
      return c.json({ success: true });
    } catch (error) {
      console.error("Error adding admin:", error);
      return c.json({
        success: false,
        message: "An unexpected error occurred.",
      }, 500);
    }
  });
}
