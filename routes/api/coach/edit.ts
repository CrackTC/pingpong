import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { updateCoach } from "../../../data/coachDao.ts";

export function useApiCoachEdit(app: Hono) {
  app.post("/api/coach/edit", async (c) => {
    const { realName, sex, birthYear, phone, email, comment } = await c.req.json();
    const claim = await getClaim(c);

    try {
      updateCoach(claim.id, { realName, sex, birthYear, phone, email, comment });
      return c.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating coach profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
