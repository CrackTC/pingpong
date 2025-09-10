import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getStudentById, updateStudentBalance } from "../../../../data/studentDao.ts";
import { addRechargeOrder } from "../../../../data/rechargeOrderDao.ts";
import { RechargeOrderStatus } from "../../../../models/rechargeOrder.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";

export function useApiAdminStudentRecharge(app: Hono) {
  app.post("/api/admin/student/recharge", async (c) => {
    const { studentId, amount } = await c.req.json();
    const claim = await getClaim(c);

    // Validation
    if (!studentId || !amount || !Number.isInteger(amount) || amount < 10 || amount > 10000) {
      return c.json({ message: "Invalid student ID or amount." }, 400);
    }

    const student = getStudentById(studentId);
    if (!student) {
      return c.json({ message: "Student not found." }, 404);
    }

    // Authorization
    if (claim.type === "admin" && claim.campusId !== student.campusId) {
      return c.json({ message: "Unauthorized" }, 401);
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
        `Your account has been recharged with ${amount} by an administrator.`,
        "/student/recharge/all",
        Date.now(),
      );

      const updatedStudent = getStudentById(studentId);

      return c.json({ message: "Recharge successful.", newBalance: updatedStudent?.balance });
    } catch (error) {
      console.error("Error recharging student account:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
