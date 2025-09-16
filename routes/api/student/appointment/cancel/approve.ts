import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../../models/appointment.ts";
import { addNotification } from "../../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../../models/notification.ts";
import {
  getStudentById,
  updateStudentBalance,
} from "../../../../../data/studentDao.ts";
import {
  deleteDeductionById,
  getDeductionByRelatedId,
} from "../../../../../data/deductionDao.ts";
import { DeductionType } from "../../../../../models/deduction.ts";
import { getClaim } from "../../../../../auth/claim.ts";
import { addSystemLog } from "../../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../../models/systemLog.ts";

export function useApiStudentApproveCancellation(app: Hono) {
  app.post("/api/student/appointment/cancel/approve", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "无效的预约ID。" }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "未找到预约。" }, 404);
      }

      const student = getStudentById(appointment.studentId);
      if (!student) {
        return c.json({ message: "未找到学生" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.id !== student.id) {
        return c.json({
          message: "您无权批准此取消。",
        }, 403);
      }

      if (appointment.status !== AppointmentStatus.CoachCancelling) {
        return c.json({
          message: "此预约未处于教练取消待处理状态。",
        }, 400);
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

      updateAppointmentStatus(appointmentId, AppointmentStatus.CoachCancelled);

      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `学生 ${student.realName} 已批准您的取消请求。`,
        `/coach/appointment/all`,
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.StudentApproveCancel,
        text:
          `学生 ${student.realName} (ID: ${student.id}) 批准了预约 ID ${appointment.id} 的取消。`,
        relatedId: appointment.id,
      });

      return c.json({ message: "取消已批准。" });
    } catch (error) {
      console.error("批准取消时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
