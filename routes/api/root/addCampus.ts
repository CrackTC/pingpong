import { Hono } from "hono";
import { addCampus, getCampusByName } from "../../../data/campusDao.ts";
import { CampusType } from "../../../models/campus.ts";

export function useApiAddCampus(app: Hono) {
  app.post("/api/root/addCampus", async (c) => {
    const { name, address, phone, email } = await c.req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return c.json({ success: false, message: "Campus name is required." }, 400);
    }
    if (!address || typeof address !== "string" || address.trim() === "") {
      return c.json({ success: false, message: "Address is required." }, 400);
    }
    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return c.json({ success: false, message: "Phone is required." }, 400);
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
      return c.json({ success: false, message: "Email is required." }, 400);
    }

    const existingCampus = getCampusByName(name);
    if (existingCampus) {
      return c.json({
        success: false,
        message: "Campus with this name already exists.",
      }, 409);
    }

    try {
      addCampus({ name, address, phone, email, type: CampusType.Branch });
      return c.json({ success: true });
    } catch (error) {
      console.error("Error adding campus:", error);
      return c.json({
        success: false,
        message: "An unexpected error occurred.",
      }, 500);
    }
  });
}
