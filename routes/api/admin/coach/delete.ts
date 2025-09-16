import { Hono } from "hono";
import { deleteCoachById, getCoachById } from "../../../../data/coachDao.ts";
import {
  deleteAppointmentsByCoachId,
  getActiveAppointmentsByCoachId,
} from "../../../../data/appointmentDao.ts";
import { deleteTimeslotsByCoachId } from "../../../../data/timeslotDao.ts";
import { deleteSelectionsByCoachId } from "../../../../data/selectionDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminCoachDelete(app: Hono) {
  app.post("/api/admin/coach/delete", async (c) => {
    const { coachId } = await c.req.json();

    if (isNaN(coachId)) {
      return c.json({ message: "无效的教练ID。" }, 400);
    }

    try {
      const coach = getCoachById(coachId);
      if (!coach) {
        return c.json({ message: "未找到教练。" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        if (admin.campus !== coach.campusId) {
          return c.json({
            message: "管理员只能删除自己校区的教练。",
          }, 403);
        }
      }

      const activeAppointments = getActiveAppointmentsByCoachId(coachId);
      if (activeAppointments.length > 0) {
        return c.json({
          message: "无法删除有活跃预约的教练。",
        }, 400);
      }

      // Delete related data
      deleteAppointmentsByCoachId(coachId);
      deleteTimeslotsByCoachId(coachId);
      deleteSelectionsByCoachId(coachId);

      // Delete coach
      deleteCoachById(coachId);

      addSystemLog({
        campusId: coach.campusId,
        type: SystemLogType.CoachRemove,
        text: `教练ID ${coachId} 已被管理员 ${claim.id} 删除`,
        relatedId: claim.id,
      });

      return c.json({ message: "教练删除成功。" });
    } catch (error) {
      console.error("删除教练时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
