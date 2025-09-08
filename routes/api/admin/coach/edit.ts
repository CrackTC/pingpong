import { Hono } from "hono";
import { getCoachById, updateCoach } from "../../../../data/coachDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";

export function useApiAdminCoachEdit(app: Hono) {
  app.post("/api/admin/coach/edit/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const formData = await c.req.formData();

    const realName = formData.get("realName") as string;
    const sex = formData.get("sex") != "null" ? parseInt(formData.get("sex") as string) : null;
    const birthYear = formData.get("birthYear") != "null" ? parseInt(formData.get("birthYear") as string) : null;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") != "null" ? formData.get("email") as string : null;
    const idCardNumber = formData.get("idCardNumber") as string;
    const comment = formData.get("comment") as string;
    const type = formData.get("type") != "null" ? parseInt(formData.get("type") as string) : null;
    const avatarFile = formData.get("avatar") as File;

    if (isNaN(id)) {
      return c.json({ message: "Invalid coach ID." }, 400);
    }

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "Phone must be 11 digits." }, 400);
    }

    if (idCardNumber && !/^\d{18}$/.test(idCardNumber)) {
      return c.json({ message: "ID card number must be 18 digits." }, 400);
    }

    let avatarPath: string | undefined;
    if (avatarFile && avatarFile.size > 0) {
      const uploadsDir = "static/avatars/coaches";
      await Deno.mkdir(uploadsDir, { recursive: true });
      const filename = `${crypto.randomUUID()}-${avatarFile.name}`;
      avatarPath = `/${uploadsDir}/${filename}`;
      await Deno.writeFile(
        `./${uploadsDir}/${filename}`,
        new Uint8Array(await avatarFile.arrayBuffer()),
      );

      // Delete old avatar if it exists and is not the default
      const coach = getCoachById(id);
      if (coach && coach.avatarPath && coach.avatarPath !== "/static/avatars/default.png") {
        try {
          await Deno.remove(`./${coach.avatarPath}`);
        } catch (e) {
          console.warn(`Could not delete old avatar: ${coach.avatarPath}`, e);
        }
      }
    }

    try {
      updateCoach(id, {
        realName,
        sex,
        birthYear,
        phone,
        email,
        idCardNumber,
        comment,
        type,
        avatarPath, // Pass the new avatar path
      });

      const coach = getCoachById(id);
      if (coach) {
        addNotification(
          coach.campusId,
          NotificationTarget.Coach,
          id,
          "Your profile has been updated by an administrator.",
          "/coach/profile",
          Date.now(),
        );
      }

      return c.json({ message: "Coach profile updated successfully", avatarPath: avatarPath || coach?.avatarPath });
    } catch (error) {
      console.error("Error updating coach profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });

  app.get("/api/admin/coach/:id", (c) => {
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
