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

export function useApiCoachAppointmentApprove(app: Hono) {
  app.post("/api/coach/appointment/approve", async (c) => {
    const { appointmentId } = await c.req.json();

    if (isNaN(appointmentId)) {
      return c.json({ message: "Invalid appointment ID." }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
      }

      const student = getStudentById(appointment.studentId);
      if (!student) {
        return c.json({ message: "Student not found." }, 404);
      }

      const coach = getCoachById(appointment.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found." }, 404);
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
          return c.json({ message: "Invalid coach type." }, 400);
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
          `Your appointment was rejected due to insufficient balance. Please recharge your account.`,
          "/student/recharge",
          Date.now(),
        );
        return c.json({
          message: "Insufficient balance. Appointment rejected.",
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
            `You have an upcoming appointment in 24 hours.`,
            "/student/appointment/all",
            Date.now(),
          );
          addNotification(
            coach.campusId,
            NotificationTarget.Coach,
            coach.id,
            `You have an upcoming appointment in 24 hours.`,
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

      addNotification(
        student.campusId,
        NotificationTarget.Student,
        student.id,
        `Your appointment has been approved by the coach.`,
        "/student/appointment/all",
        Date.now(),
      );

      return c.json({ message: "Appointment approved successfully." });
    } catch (error) {
      console.error("Error approving appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
