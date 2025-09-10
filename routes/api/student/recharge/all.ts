import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getRechargeOrdersByStudentId } from "../../../../data/rechargeOrderDao.ts";

export function useApiStudentRechargeAll(app: Hono) {
  app.get("/api/student/recharge/all", async (c) => {
    const claim = await getClaim(c);

    try {
      const orders = getRechargeOrdersByStudentId(claim.id);
      return c.json(orders);
    } catch (error) {
      console.error("Error fetching recharge orders:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
