import { Hono } from "hono";
import { updateCoach, getCoachById } from "../../../../data/coachDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";

export function useApiAdminCoachEdit(app: Hono) {
  app.post("/api/admin/coach/edit/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const { realName, sex, birthYear, phone, email, idCardNumber, comment, type } = await c.req.json();

    if (isNaN(id)) {
        return c.json({ message: "Invalid coach ID." }, 400);
    }

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "Phone must be 11 digits." }, 400);
    }

    if (idCardNumber && !/^\d{18}$/.test(idCardNumber)) {
      return c.json({ message: "ID card number must be 18 digits." }, 400);
    }

    try {
      updateCoach(id, { realName, sex, birthYear, phone, email, idCardNumber, comment, type });
      
      const coach = getCoachById(id);
      if (coach) {
        addNotification(
          coach.campusId,
          NotificationTarget.Coach,
          id,
          "Your profile has been updated by an administrator.",
          "/coach/profile",
          Date.now()
        );
      }

      return c.json({ message: "Coach profile updated successfully" });
    } catch (error) {
      console.error("Error updating coach profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });

  app.get("/api/admin/coach/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
        return c.json({ message: "Invalid coach ID." }, 400);
    }
    try {
        const coach = getCoachById(id);
        if (!coach) {
            return c.json({ message: "Coach not found." }, 404);
        }
        return c.json(coach);
    } catch (error) {
        console.error("Error fetching coach data:", error);
        return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
