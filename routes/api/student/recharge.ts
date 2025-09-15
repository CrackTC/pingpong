import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { addRechargeOrder } from "../../../data/rechargeOrderDao.ts";
import { RechargeOrderStatus } from "../../../models/rechargeOrder.ts";
import { addSystemLog } from "../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../models/systemLog.ts";
import { getStudentById } from "../../../data/studentDao.ts";

export function useApiStudentRecharge(app: Hono) {
  app.post("/api/student/recharge", async (c) => {
    const { amount } = await c.req.json();
    const claim = await getClaim(c);

    const student = getStudentById(claim.id);
    if (!student) {
      return c.json({ message: "Student not found." }, 404);
    }

    if (!amount || !Number.isInteger(amount) || amount < 10 || amount > 10000) {
      return c.json({
        message:
          "Invalid amount. Amount must be an integer between 10 and 10000.",
      }, 400);
    }

    const orderNumber = `${Date.now()}${claim.id}`;

    try {
      const id = addRechargeOrder({
        orderNumber,
        studentId: claim.id,
        amount,
        status: RechargeOrderStatus.Created,
      });

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentRecharge,
        text:
          `Student ${student.realName} (ID: ${claim.id}) created a recharge order of amount ${amount}.`,
        relatedId: id,
      });

      return c.json({ orderNumber });
    } catch (error) {
      console.error("Error creating recharge order:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
