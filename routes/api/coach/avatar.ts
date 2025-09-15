import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getCoachById, updateCoachAvatarPath } from "../../../data/coachDao.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";

export function useApiCoachAvatar(app: Hono) {
  app.post("/api/coach/avatar", async (c) => {
    const claim = await getClaim(c);

    if (!claim || claim.type !== "coach") {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const coach = getCoachById(claim.id);
    if (!coach) {
      return c.json({ message: "Coach not found" }, 404);
    }

    const body = await c.req.formData();
    const avatarFile = body.get("avatar");

    if (!avatarFile || !(avatarFile instanceof File)) {
      return c.json({ message: "No avatar file provided" }, 400);
    }

    // Generate a unique filename
    const filename = `${crypto.randomUUID()}-${avatarFile.name}`;
    const avatarPath = `/static/avatars/coaches/${filename}`;
    const fullPath = `./static/avatars/coaches/${filename}`;

    try {
      // Save the new avatar
      await Deno.writeFile(
        fullPath,
        new Uint8Array(await avatarFile.arrayBuffer()),
      );

      // Delete the old avatar if it exists and is not the default
      if (
        coach.avatarPath && coach.avatarPath !== "/static/avatars/default.png"
      ) {
        try {
          await Deno.remove(`./${coach.avatarPath}`);
        } catch (e) {
          console.warn(`Could not delete old avatar: ${coach.avatarPath}`, e);
        }
      }

      // Update the database
      updateCoachAvatarPath(claim.id, avatarPath);

      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachChangeAvatar,
        text: `Coach ${coach.realName} changed their avatar.`,
        relatedId: coach.id,
      });

      return c.json({ message: "Avatar updated successfully", avatarPath });
    } catch (error) {
      console.error("Error changing coach avatar:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
