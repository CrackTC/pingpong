import { Hono } from "hono";
import { getPendingCoaches } from "../../../../data/coachDao.ts";
import { getClaim } from "../../../../auth/claim.ts"; // Import getClaim
import { getAdminById } from "../../../../data/adminDao.ts"; // Import getAdminById

export function useApiAdminCoachPending(app: Hono) { // Renamed function
  app.get("/api/admin/coach/pending", async (c) => {
    const claim = await getClaim(c);

    let coaches;
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ message: "未找到管理员" }, 404);
      }
      coaches = getPendingCoaches(admin.campus); // Pass admin's campusId
    } else if (claim.type === "root") {
      coaches = getPendingCoaches(); // Root sees all pending coaches
    } else {
      return c.json({ message: "禁止访问" }, 403);
    }

    return c.json(coaches);
  });
}
