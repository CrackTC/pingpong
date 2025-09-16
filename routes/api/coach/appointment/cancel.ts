import { Hono } from "hono";
import {
  getAppointmentById,
  getCoachCancelCountThisMonth,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { calcDate } from "../../../../utils.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachAppointmentCancel(app: Hono) {
  app.post("/api/coach/appointment/cancel", async (c) => {
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
      if (claim.id !== appointment.coachId) {
        return c.json({ message: "未授权。" }, 403);
      }

      if (appointment.status !== AppointmentStatus.Approved) {
        return c.json(
          { message: "只有已批准的预约才能取消。" },
          400,
        );
      }

      const count = getCoachCancelCountThisMonth(claim.id);
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

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "未找到教练" }, 404);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.CoachCancelling);

      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `教练 ${coach.realName} 已请求取消预约。`,
        `/student/appointment/cancelling`,
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.CoachCancelAppointment,
        text: `教练 ${coach.realName} 请求取消预约 ID ${appointment.id}。`,
        relatedId: appointment.id,
      });

      return c.json({ message: "预约取消请求已发送。" });
    } catch (error) {
      console.error("取消预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
