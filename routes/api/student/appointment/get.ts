import { Hono } from "hono";
import { getAppointmentById } from "../../../../data/appointmentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";

export function useApiStudentAppointmentGet(app: Hono) {
  app.get("/api/student/appointment/:id", async (c) => {
    const id = c.req.param("id");
    const claim = await getClaim(c);

    if (!id) {
      return c.json({ success: false, message: "预约ID是必填项。" }, 400);
    }

    const appointment = getAppointmentById(parseInt(id));
    if (!appointment) {
      return c.json({ success: false, message: "未找到预约。" }, 404);
    }

    // Authorization check
    if (appointment.studentId !== claim.id) {
      return c.json({ success: false, message: "未授权" }, 401);
    }

    return c.json(appointment);
  });
}
