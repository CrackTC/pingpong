import { Hono } from "hono";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getAllTimeslots } from "../../../../data/timeslotDao.ts";
import { getActiveAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";
import { getTableById } from "../../../../data/tableDao.ts";

export function useApiStudentCoachTimeslots(app: Hono) {
  app.post("/api/student/coach/timeslots", async (c) => {
    const { coachId } = await c.req.json(); // Get coachId from request body

    if (isNaN(coachId)) {
      return c.json({ message: "无效的教练ID。" }, 400);
    }

    try {
      const coach = getCoachById(coachId);
      if (!coach) {
        return c.json({ message: "未找到教练。" }, 404);
      }

      const appointments = getActiveAppointmentsByCoachId(coachId);
      const bookedTimeslotsMap = new Map(
        appointments.map((a) => [a.timeslotId, a]),
      );

      // Get timeslots for the coach
      const timeslots = getAllTimeslots(coachId);

      const timeslotsWithStatus = timeslots.map((ts) => {
        const appointment = bookedTimeslotsMap.get(ts.id);
        if (appointment) {
          const table = getTableById(appointment.tableId);
          return {
            ...ts,
            isBooked: true,
            tableName: table ? table.name : "Unknown",
          };
        }
        return {
          ...ts,
          isBooked: false,
        };
      });

      return c.json(timeslotsWithStatus);
    } catch (error) {
      console.error("获取教练时间段时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
