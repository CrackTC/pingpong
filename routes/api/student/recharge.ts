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
      return c.json({ message: "未找到学生。" }, 404);
    }

    if (!amount || !Number.isInteger(amount) || amount < 10 || amount > 10000) {
      return c.json({
        message: "无效金额。金额必须是10到10000之间的整数。",
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
          `学生 ${student.realName} (ID: ${claim.id}) 创建了金额为 ${amount} 的充值订单。`,
        relatedId: id,
      });

      return c.json({ orderNumber });
    } catch (error) {
      console.error("创建充值订单时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
