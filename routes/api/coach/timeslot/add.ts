import { Hono } from "hono";
import {
  addTimeslot,
  hasTimeslotOverlap,
} from "../../../../data/timeslotDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiCoachTimeslotAdd(app: Hono) {
  app.post("/api/coach/timeslot/add", async (c) => {
    const timeslotData = await c.req.json();
    const claim = await getClaim(c);
    const coach = getCoachById(claim.id);
    if (!coach) {
      return c.json({ message: "未找到教练。" }, 404);
    }

    timeslotData.coachId = claim.id; // Set coachId from claim for coaches

    // Validate time order (start before end)
    const startTotalMinutes = timeslotData.startHour * 60 +
      timeslotData.startMinute;
    const endTotalMinutes = timeslotData.endHour * 60 + timeslotData.endMinute;

    if (startTotalMinutes >= endTotalMinutes) {
      return c.json({ message: "结束时间必须在开始时间之后。" }, 400);
    }

    // Check for overlap
    if (
      hasTimeslotOverlap(
        timeslotData.weekday,
        timeslotData.startHour,
        timeslotData.startMinute,
        timeslotData.endHour,
        timeslotData.endMinute,
        timeslotData.coachId,
      )
    ) {
      return c.json(
        { message: "时间段与现有时间段重叠。" },
        400,
      );
    }

    try {
      const id = addTimeslot(timeslotData);
      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachAddTimeslot,
        text: `教练 ${coach.realName} 添加了一个新的时间段 (ID: ${id})。`,
        relatedId: id,
      });
      return c.json({ message: "时间段添加成功！" });
    } catch (error) {
      console.error("添加时间段时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
