import { Hono } from "hono";
import {
  getAppointmentById,
  updateAppointmentStatus,
} from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import {
  getStudentById,
  updateStudentBalance,
} from "../../../../data/studentDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { addDeduction } from "../../../../data/deductionDao.ts";
import { DeductionType } from "../../../../models/deduction.ts";
import { CoachType } from "../../../../models/coach.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { calcDate, scheduleTask } from "../../../../utils.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachAppointmentApprove(app: Hono) {
  app.post("/api/coach/appointment/approve", async (c) => {
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

      const student = getStudentById(appointment.studentId);
      if (!student) {
        return c.json({ message: "未找到学生。" }, 404);
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "未找到教练。" }, 404);
      }

      let rate = 0;
      switch (coach.type) {
        case CoachType.Junior:
          rate = 80;
          break;
        case CoachType.Intermediate:
          rate = 150;
          break;
        case CoachType.Senior:
          rate = 200;
          break;
        default:
          return c.json({ message: "无效的教练类型。" }, 400);
      }

      const durationInMinutes =
        (appointment.endHour - appointment.startHour) * 60 +
        (appointment.endMinute - appointment.startMinute);
      const durationInHours = durationInMinutes / 60;
      const cost = Math.ceil(durationInHours * rate);

      if (student.balance < cost) {
        updateAppointmentStatus(appointmentId, AppointmentStatus.Rejected);
        addNotification(
          student.campusId,
          NotificationTarget.Student,
          student.id,
          `您的预约因余额不足而被拒绝。请充值您的账户。`,
          "/student/recharge",
          Date.now(),
        );
        return c.json({
          message: "余额不足。预约已拒绝。",
        }, 400);
      }

      updateStudentBalance(student.id, -cost);
      addDeduction({
        studentId: student.id,
        type: DeductionType.Appointment,
        amount: cost,
        relatedId: appointmentId,
      });

      updateAppointmentStatus(appointmentId, AppointmentStatus.Approved);

      const completeAppointment = () => {
        const appointment = getAppointmentById(appointmentId);
        if (!appointment) return;
        if (appointment.status === AppointmentStatus.Pending) {
          updateAppointmentStatus(appointmentId, AppointmentStatus.Outdated);
        } else if (
          appointment.status === AppointmentStatus.Approved ||
          appointment.status === AppointmentStatus.StudentCancelling ||
          appointment.status === AppointmentStatus.CoachCancelling
        ) {
          updateAppointmentStatus(appointmentId, AppointmentStatus.Completed);
        }
      };

      const startTime = calcDate(
        appointment.createdAt,
        appointment.weekday,
        appointment.startHour,
        appointment.startMinute,
      );

      if (startTime > new Date()) {
        scheduleTask(completeAppointment, startTime);
      } else {
        completeAppointment();
      }

      const remind = () => {
        const appointment = getAppointmentById(appointmentId);
        if (!appointment) return;
        if (
          appointment.status === AppointmentStatus.Approved ||
          appointment.status === AppointmentStatus.StudentCancelling ||
          appointment.status === AppointmentStatus.CoachCancelling
        ) {
          addNotification(
            student.campusId,
            NotificationTarget.Student,
            student.id,
            `您有一个24小时内即将开始的预约。`,
            "/student/appointment/all",
            Date.now(),
          );
          addNotification(
            coach.campusId,
            NotificationTarget.Coach,
            coach.id,
            `您有一个24小时内即将开始的预约。`,
            "/coach/appointment/all",
            Date.now(),
          );
        }
      };

      const reminderTime = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);

      if (reminderTime > new Date()) {
        scheduleTask(remind, reminderTime);
      } else {
        remind();
      }

      const endTime = calcDate(
        appointment.createdAt,
        appointment.weekday,
        appointment.endHour,
        appointment.endMinute,
      );

      scheduleTask(() => {
        const appointment = getAppointmentById(appointmentId);
        if (!appointment) return;
        if (appointment.status === AppointmentStatus.Completed) {
          addNotification(
            student.campusId,
            NotificationTarget.Student,
            student.id,
            `您的预约已完成。请记得评价您的教练。`,
            `/student/appointment/review/${appointment.id}`,
            Date.now(),
          );
          addNotification(
            coach.campusId,
            NotificationTarget.Coach,
            coach.id,
            `您的预约已完成。请记得评价您的学生。`,
            `/coach/appointment/review/${appointment.id}`,
            Date.now(),
          );
        }
      }, endTime);

      addNotification(
        student.campusId,
        NotificationTarget.Student,
        student.id,
        `您的预约已获得教练批准。`,
        "/student/appointment/all",
        Date.now(),
      );

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.CoachApproveAppointment,
        text:
          `教练 ${coach.realName} 批准了学生 ${student.realName} 的预约 #${appointment.id}。`,
        relatedId: appointment.id,
      });

      return c.json({ message: "预约成功批准。" });
    } catch (error) {
      console.error("批准预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
