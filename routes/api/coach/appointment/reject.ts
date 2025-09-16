import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { getCoachById } from "../../../../data/coachDao.ts";

export function useApiCoachAppointmentReject(app: Hono) {
  app.post("/api/coach/appointment/reject", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "无效的预约ID。" }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "未找到预约。" }, 404);
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "未找到教练。" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.id !== appointment.coachId) {
        return c.json({
          message: "您无权拒绝此预约。",
        }, 403);
      }

      updateAppointmentStatus(appointmentId, AppointmentStatus.Rejected);

      addNotification(
        appointment.campusId,
        NotificationTarget.Student,
        appointment.studentId,
        `您的预约已被教练拒绝。`,
        "/student/appointment/all",
        Date.now(),
      );

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.CoachRejectAppointment,
        text:
          `教练 ${coach.realName} (ID: ${coach.id}) 拒绝了预约 ID: ${appointment.id}。`,
        relatedId: appointment.id,
      });

      return c.json({ message: "预约成功拒绝。" });
    } catch (error) {
      console.error("拒绝预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
