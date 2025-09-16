import { Hono } from "hono";
import { getTimeslotById } from "../../../../data/timeslotDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getAvailableTables } from "../../../../data/tableDao.ts";

export function useApiStudentTableAvailable(app: Hono) {
  app.post("/api/student/table/available", async (c) => {
    const { timeslotId } = await c.req.json();

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

      const availableTables = getAvailableTables(coach.campusId, timeslot);
      return c.json(availableTables);
    } catch (error) {
      console.error("获取可用球台时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
