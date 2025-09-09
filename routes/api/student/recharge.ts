import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { addRechargeOrder } from "../../../data/rechargeOrderDao.ts";
import { RechargeOrderStatus } from "../../../models/rechargeOrder.ts";

export function useApiStudentRecharge(app: Hono) {
  app.post("/api/student/recharge", async (c) => {
    const { amount } = await c.req.json();
    const claim = await getClaim(c);

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return c.json({ message: "Invalid amount." }, 400);
    }

    const orderNumber = `${Date.now()}${claim.id}`;

    try {
      addRechargeOrder({
        orderNumber,
        studentId: claim.id,
        amount,
        status: RechargeOrderStatus.Created,
      });

      return c.json({ orderNumber });
    } catch (error) {
      console.error("Error creating recharge order:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
