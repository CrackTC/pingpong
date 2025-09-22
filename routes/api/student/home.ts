import { getClaim } from "../../../auth/claim.ts";
import { getUnreadNotificationCountForUser } from "../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../models/notification.ts";
import { getStudentById } from "../../../data/studentDao.ts";
import { getActiveAppointmentsByStudentId } from "../../../data/appointmentDao.ts";
import { getMatchesByStudentId } from "../../../data/matchDao.ts";

export function useApiStudentHome(app: Hono) {
  app.get("/api/student/home", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    // 获取未读通知数量
    const unreadNotificationCount = getUnreadNotificationCountForUser(
      studentId,
      NotificationTarget.Student,
    );

    // 获取待完成预约数量
    const activeAppointments = getActiveAppointmentsByStudentId(studentId);
    const upcomingAppointments = activeAppointments.length;

    // 获取学生参加的比赛数量
    const matches = getMatchesByStudentId(studentId);
    const joinedContests = matches.length > 0 ? matches.length : 0;

    // 获取学生账户余额和基本信息
    const student = getStudentById(studentId);
    const balance = student?.balance || 0;

    return c.json({
      unreadNotificationCount,
      upcomingAppointments,
      joinedContests,
      balance,
      student: {
        id: student?.id,
        username: student?.username,
        realName: student?.realName,
        campusName: student?.campusName,
      },
    });
  });
}
