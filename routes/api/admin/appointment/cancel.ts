import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import {
  deleteDeductionById,
  getDeductionByRelatedId,
} from "../../../../data/deductionDao.ts";
import { updateStudentBalance } from "../../../../data/studentDao.ts";
import { DeductionType } from "../../../../models/deduction.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminAppointmentCancel(app: Hono) {
  app.post("/api/admin/appointment/cancel", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "无效的预约ID。" }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "未找到预约。" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        if (admin.campus !== appointment.campusId) {
          return c.json({
            message: "您无权取消此预约，因为它不属于您的校区。",
          }, 403);
        }
      }

      // Refund the student
      const deduction = getDeductionByRelatedId(
        appointmentId,
        DeductionType.Appointment,
      );
      if (deduction) {
        updateStudentBalance(appointment.studentId, deduction.amount);
        deleteDeductionById(deduction.id);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.AdminCancelled);

      // Notify student
      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `您的预约已被管理员取消。`,
        `/student/appointment/all`,
        Date.now(),
      );

      // Notify coach
      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `一个预约已被管理员取消。`,
        `/coach/appointment/all`,
        Date.now(),
      );

      addSystemLog({
        type: SystemLogType.AdminCancelAppointment,
        campusId: appointment.campusId,
        relatedId: appointment.id,
        text: `预约ID ${appointment.id} 被管理员 ${claim.id} 取消。`,
      });

      return c.json({ message: "预约已成功取消。" });
    } catch (error) {
      console.error("取消预约时发生错误：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
