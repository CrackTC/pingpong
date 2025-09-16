import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  getStudentById,
  updateStudentBalance,
} from "../../../../data/studentDao.ts";
import { addRechargeOrder } from "../../../../data/rechargeOrderDao.ts";
import { RechargeOrderStatus } from "../../../../models/rechargeOrder.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminStudentRecharge(app: Hono) {
  app.post("/api/admin/student/recharge", async (c) => {
    const { studentId, amount } = await c.req.json();
    const claim = await getClaim(c);

    // Validation
    if (
      !studentId || !amount || !Number.isInteger(amount) || amount < 10 ||
      amount > 10000
    ) {
      return c.json({ message: "无效的学生ID或金额。" }, 400);
    }

    const student = getStudentById(studentId);
    if (!student) {
      return c.json({ message: "未找到学生。" }, 404);
    }

    // Authorization
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (admin?.campus !== student.campusId) {
        return c.json({ message: "未授权" }, 401);
      }
    }

    const orderNumber = `${Date.now()}${studentId}`;

    try {
      // Update student balance
      updateStudentBalance(studentId, amount);

      // Create recharge order
      addRechargeOrder({
        orderNumber,
        studentId,
        amount,
        status: RechargeOrderStatus.Paid, // Mark as paid since it's an admin recharge
      });

      // Send notification
      addNotification(
        student.campusId,
        NotificationTarget.Student,
        studentId,
        `您的账户已由管理员充值 ${amount}。`,
        "/student/recharge/all",
        Date.now(),
      );

      const updatedStudent = getStudentById(studentId);

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentRecharge,
        text:
          `管理员 ${claim.id} 为学生 ID ${studentId} 充值 ${amount}。新余额：${updatedStudent?.balance}`,
        relatedId: studentId,
      });

      return c.json({
        message: "充值成功。",
        newBalance: updatedStudent?.balance,
      });
    } catch (error) {
      console.error("充值学生账户时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
