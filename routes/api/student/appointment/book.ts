import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getTimeslotById } from "../../../../data/timeslotDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getAvailableTables } from "../../../../data/tableDao.ts";
import { addAppointment } from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getStudentById } from "../../../../data/studentDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiStudentAppointmentBook(app: Hono) {
  app.post("/api/student/appointment/book", async (c) => {
    const { timeslotId, tableId } = await c.req.json();
    const claim = await getClaim(c);

    if (isNaN(timeslotId)) {
      return c.json({ message: "无效的时间段ID。" }, 400);
    }

    try {
      const timeslot = getTimeslotById(timeslotId);
      if (!timeslot) {
        return c.json({ message: "未找到时间段。" }, 404);
      }

      const coach = getCoachById(timeslot.coachId);
      if (!coach) {
        return c.json({ message: "未找到教练。" }, 404);
      }

      const studentId = claim.id;
      const student = getStudentById(studentId);
      if (!student) {
        return c.json({ message: "未找到学生" }, 404);
      }

      let selectedTableId = tableId;

      if (!selectedTableId) {
        // "Let the system select"
        const availableTables = getAvailableTables(coach.campusId, timeslot);
        if (availableTables.length === 0) {
          return c.json(
            { message: "此时间段没有可用球台。" },
            400,
          );
        }
        selectedTableId = availableTables[0].id;
      }

      const id = addAppointment({
        campusId: coach.campusId,
        studentId,
        coachId: timeslot.coachId,
        tableId: selectedTableId,
        timeslotId,
        status: AppointmentStatus.Pending,
        createdAt: Date.now(),
      });

      addNotification(
        coach.campusId,
        NotificationTarget.Coach,
        coach.id,
        `来自 ${student.realName} 的新预约请求`,
        `/coach/appointment/pending`, // Link for coach to view pending appointments
        Date.now(),
      );

      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.StudentBookAppointment,
        text:
          `学生 ${student.realName} (ID: ${student.id}) 预约了教练 ${coach.realName} (ID: ${coach.id}) 的时间段 ID ${timeslot.id}。`,
        relatedId: id,
      });

      return c.json({ message: "预约成功。" });
    } catch (error) {
      console.error("预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
