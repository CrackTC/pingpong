import { Hono } from "hono";
import { getActiveAppointmentsByCoachId } from "../../../../data/appointmentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";

export function useApiAdminCoachAppointments(app: Hono) {
  app.get("/api/admin/coach/appointments/:id", async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ success: false, message: "教练ID是必填项。" }, 400);
    }

    const claim = await getClaim(c);
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ success: false, message: "未找到管理员。" }, 404);
      }
      const coach = getCoachById(parseInt(id));
      if (!coach) {
        return c.json({ success: false, message: "未找到教练。" }, 404);
      }
      if (admin.campus != coach.campusId) {
        return c.json({
          success: false,
          message:
            "您无权查看此教练的预约。",
        }, 403);
      }
    }

    try {
      const appointments = getActiveAppointmentsByCoachId(parseInt(id));
      return c.json(appointments);
    } catch (error) {
      console.error("获取活跃预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
