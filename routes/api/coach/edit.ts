import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { updateCoach } from "../../../data/coachDao.ts";

export function useApiCoachEdit(app: Hono) {
  app.post("/api/coach/edit", async (c) => {
    const { realName, sex, birthYear, phone, email, idCardNumber, comment } = await c.req.json();
    const claim = await getClaim(c);

    if (idCardNumber && !/^\d{18}$/.test(idCardNumber)) {
      return c.json({ message: "ID card number must be 18 digits." }, 400);
    }

    if (phone && !/^\d{11}$/.test(phone)) {
      return c.json({ message: "Phone must be 11 digits." }, 400);
    }

    try {
      updateCoach(claim.id, { realName, sex, birthYear, phone, email, idCardNumber, comment });
      return c.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating coach profile:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
