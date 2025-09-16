import { Hono } from "hono";
import {
  getAppointmentById,
  getStudentCancelCountThisMonth,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { getStudentById } from "../../../../data/studentDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { calcDate } from "../../../../utils.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiStudentAppointmentCancel(app: Hono) {
  app.post("/api/student/appointment/cancel", async (c) => {
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
        return c.json({ message: "未授权" }, 403);
      }

      if (appointment.status !== AppointmentStatus.Approved) {
        return c.json(
          { message: "只有已批准的预约才能取消。" },
          400,
        );
      }

      const count = getStudentCancelCountThisMonth(claim.id);
      if (count == 3) {
        return c.json(
          {
            message:
              "您本月已达到3次取消上限。请联系支持人员以获得进一步帮助。",
          },
          400,
        );
      }

      const startDate = calcDate(
        appointment.createdAt,
        appointment.weekday,
        appointment.startHour,
        appointment.startMinute,
      );
      if (startDate.getTime() - (new Date().getTime()) < 24 * 60 * 60 * 1000) {
        return c.json(
          { message: "无法在24小时内取消预约。" },
          400,
        );
      }

      updateAppointmentStatus(
        appointmentId,
        AppointmentStatus.StudentCancelling,
      );

      addNotification(
        appointment.campusId,
        NotificationTarget.Coach,
        appointment.coachId,
        `学生 ${student.realName} 已请求取消预约。`,
        `/coach/appointment/cancelling`,
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.StudentCancelAppointment,
        text:
          `学生 ${student.realName} (ID: ${student.id}) 请求取消预约 ID ${appointment.id}。`,
        relatedId: appointment.id,
      });

      return c.json({ message: "预约取消请求已发送。" });
    } catch (error) {
      console.error("取消预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
