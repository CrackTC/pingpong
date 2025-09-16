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
      return c.json({ message: "未找到订单。" }, 404);
    }

    return c.json(order);
  });

  app.post("/api/payment/pay", async (c) => {
    const { orderNumber } = await c.req.json();
    const order = getRechargeOrderByOrderNumber(orderNumber);

    if (!order) {
      return c.json({ message: "未找到订单。" }, 404);
    }

    if (order.status !== RechargeOrderStatus.Created) {
      return c.json({ message: "订单已被处理。" }, 400);
    }

    const student = getStudentById(order.studentId);
    if (!student) {
      return c.json({ message: "未找到学生。" }, 404);
    }

    try {
      updateRechargeOrderStatus(orderNumber, RechargeOrderStatus.Paid);
      updateStudentBalance(order.studentId, order.amount);

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.PaymentComplete,
        text: `学生ID ${order.studentId} 完成了 ${order.amount} 元的充值。`,
        relatedId: order.id,
      });
      return c.json({ message: "支付成功。" });
    } catch (error) {
      console.error("处理付款时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });

  app.post("/api/payment/cancel", async (c) => {
    const { orderNumber } = await c.req.json();
    const order = getRechargeOrderByOrderNumber(orderNumber);

    if (!order) {
      return c.json({ message: "未找到订单。" }, 404);
    }

    if (order.status !== RechargeOrderStatus.Created) {
      return c.json({ message: "订单已被处理。" }, 400);
    }

    const student = getStudentById(order.studentId);
    if (!student) {
      return c.json({ message: "未找到学生。" }, 404);
    }

    try {
      updateRechargeOrderStatus(orderNumber, RechargeOrderStatus.Cancelled);
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.PaymentCancel,
        text: `学生ID ${order.studentId} 取消了 ${order.amount} 元的充值。`,
        relatedId: order.id,
      });
      return c.json({ message: "订单已取消。" });
    } catch (error) {
      console.error("取消订单时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
