import { Hono } from "hono";
import { getActiveAppointmentsByStudentId } from "../../../../data/appointmentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { getStudentById } from "../../../../data/studentDao.ts";

export function useApiAdminStudentAppointments(app: Hono) {
  app.get("/api/admin/student/appointments/:id", async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json(
        { success: false, message: "学生ID是必填项。" },
        400,
      );
    }

    const claim = await getClaim(c);
    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ success: false, message: "未找到管理员。" }, 404);
      }
      const student = getStudentById(parseInt(id));
      if (!student) {
        return c.json({ success: false, message: "未找到学生。" }, 404);
      }
      if (admin.campus != student.campusId) {
        return c.json({
          success: false,
          message:
            "您无权查看此学生的预约。",
        }, 403);
      }
    }

    try {
      const appointments = getActiveAppointmentsByStudentId(parseInt(id));
      return c.json(appointments);
    } catch (error) {
      console.error("获取活跃预约时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
