import { Hono } from "hono";
import { getUnreadNotificationCountForUser } from "../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../models/notification.ts";
import { getClaim } from "../../../auth/claim.ts";
import { getStudentsByCoachId } from "../../../data/selectionDao.ts";
import { getActiveAppointmentsByCoachId } from "../../../data/appointmentDao.ts";
import { getPendingSelectionsForCoach } from "../../../data/selectionDao.ts";

export function useApiCoachHome(app: Hono) {
  app.get("/api/coach/home", async (c) => {
    const claim = await getClaim(c); // Get claim from middleware

    // 获取统计数据
    const unreadNotificationCount = getUnreadNotificationCountForUser(
      claim.id,
      NotificationTarget.Coach,
    );

    // 获取已批准的学生数量
    const students = getStudentsByCoachId(claim.id);
    const studentCount = students.length;

    // 获取活跃的预约数量（待处理和已批准的）
    const activeAppointments = getActiveAppointmentsByCoachId(claim.id);
    const pendingAppointmentsCount = activeAppointments.length;

    // 获取待处理的选择请求数量
    const pendingSelections = getPendingSelectionsForCoach(claim.id);
    const pendingSelectionsCount = pendingSelections.length;

    return c.json({
      unreadNotificationCount,
      studentCount,
      pendingAppointmentsCount,
      pendingSelectionsCount,
    });
  });
}
