import { Hono } from "hono";
import {
  getRechargeOrderByOrderNumber,
  updateRechargeOrderStatus,
} from "../../data/rechargeOrderDao.ts";
import { getStudentById, updateStudentBalance } from "../../data/studentDao.ts";
import { RechargeOrderStatus } from "../../models/rechargeOrder.ts";
import { addSystemLog } from "../../data/systemLogDao.ts";
import { SystemLogType } from "../../models/systemLog.ts";

export function useApiPayment(app: Hono) {
  app.get("/api/payment/order/:orderNumber", (c) => {
    const orderNumber = c.req.param("orderNumber");
    const order = getRechargeOrderByOrderNumber(orderNumber);

    if (!order) {
      return c.json({ message: "Order not found." }, 404);
    }

    return c.json(order);
  });

  app.post("/api/payment/pay", async (c) => {
    const { orderNumber } = await c.req.json();
    const order = getRechargeOrderByOrderNumber(orderNumber);

    if (!order) {
      return c.json({ message: "Order not found." }, 404);
    }

    if (order.status !== RechargeOrderStatus.Created) {
      return c.json({ message: "Order has already been processed." }, 400);
    }

    const student = getStudentById(order.studentId);
    if (!student) {
      return c.json({ message: "Student not found." }, 404);
    }

    try {
      updateRechargeOrderStatus(orderNumber, RechargeOrderStatus.Paid);
      updateStudentBalance(order.studentId, order.amount);

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.PaymentComplete,
        text:
          `Student ID ${order.studentId} completed a recharge of $${order.amount}.`,
        relatedId: order.id,
      });
      return c.json({ message: "Payment successful." });
    } catch (error) {
      console.error("Error processing payment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });

  app.post("/api/payment/cancel", async (c) => {
    const { orderNumber } = await c.req.json();
    const order = getRechargeOrderByOrderNumber(orderNumber);

    if (!order) {
      return c.json({ message: "Order not found." }, 404);
    }

    if (order.status !== RechargeOrderStatus.Created) {
      return c.json({ message: "Order has already been processed." }, 400);
    }

    const student = getStudentById(order.studentId);
    if (!student) {
      return c.json({ message: "Student not found." }, 404);
    }

    try {
      updateRechargeOrderStatus(orderNumber, RechargeOrderStatus.Cancelled);
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.PaymentCancel,
        text:
          `Student ID ${order.studentId} cancelled a recharge of $${order.amount}.`,
        relatedId: order.id,
      });
      return c.json({ message: "Order cancelled." });
    } catch (error) {
      console.error("Error cancelling order:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
