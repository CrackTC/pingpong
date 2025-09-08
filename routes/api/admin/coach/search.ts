import { Hono } from "hono";
import { searchCoachesByIdCardOrPhone } from "../../../../data/coachDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminCoachSearch(app: Hono) {
  app.post("/api/admin/coach/search", async (c) => {
    const { query } = await c.req.json();
    const claim = await getClaim(c);

    if (!query) {
      return c.json({ message: "Search query is required." }, 400);
    }

    try {
      let coaches;
      if (claim.type === "root") {
        coaches = searchCoachesByIdCardOrPhone(query);
      } else {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }
        coaches = searchCoachesByIdCardOrPhone(query, admin.campus);
      }
      return c.json(coaches);
    } catch (error) {
      console.error("Error searching coaches:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
