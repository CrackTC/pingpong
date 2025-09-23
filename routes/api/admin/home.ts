import { getClaim } from "../../../auth/claim.ts";
import {
  getUnreadNotificationCountForAdmin,
} from "../../../data/notificationDao.ts";
import { getAdminById } from "../../../data/adminDao.ts";
import { db } from "../../../data/db.ts";
import { CoachType } from "../../../models/coach.ts";
import { AppointmentStatus } from "../../../models/appointment.ts";
import { SelectionStatus } from "../../../models/selection.ts";
import { MigrationStatus } from "../../../models/migration.ts";

export function useApiAdminHome(app: Hono) {
  app.get("/api/admin/home", async (c) => {
    const claim = await getClaim(c);
    if (claim.type === "root") {
      // 获取所有统计数据（root管理员查看所有校区）
      const unreadCount = getUnreadNotificationCountForAdmin();
      const totalStudents = getTotalStudentsCount();
      const totalCoaches = getTotalCoachesCount();
      const pendingCoaches = getPendingCoachesCount();
      const pendingAppointments = getPendingAppointmentsCount();
      const pendingMigrations = getPendingMigrationsCount();

      return c.json({
        unreadNotificationCount: unreadCount,
        totalStudentsCount: totalStudents,
        totalCoachesCount: totalCoaches,
        pendingCoachesCount: pendingCoaches,
        pendingAppointmentsCount: pendingAppointments,
        pendingMigrationsCount: pendingMigrations,
      });
    } else if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (!admin) {
        return c.json({ message: "未找到管理员。" }, 404);
      }

      // 获取指定校区的统计数据（普通管理员只查看自己校区）
      const unreadCount = getUnreadNotificationCountForAdmin(admin.campus);
      const totalStudents = getTotalStudentsCount(admin.campus);
      const totalCoaches = getTotalCoachesCount(admin.campus);
      const pendingCoaches = getPendingCoachesCount(admin.campus);
      const pendingAppointments = getPendingAppointmentsCount(admin.campus);
      const pendingMigrations = getPendingMigrationsCount(admin.campus);

      return c.json({
        unreadNotificationCount: unreadCount,
        totalStudentsCount: totalStudents,
        totalCoachesCount: totalCoaches,
        pendingCoachesCount: pendingCoaches,
        pendingAppointmentsCount: pendingAppointments,
        pendingMigrationsCount: pendingMigrations,
      });
    } else {
      return c.json({ message: "未授权。" }, 403);
    }
  });
}

// 获取学生总数
function getTotalStudentsCount(campusId?: number): number {
  let query = "SELECT COUNT(*) as count FROM students";
  const params: number[] = [];

  if (campusId !== undefined) {
    query += " WHERE campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params) as { count: number };
  return row?.count ?? 0;
}

// 获取教练总数
function getTotalCoachesCount(campusId?: number): number {
  let query = "SELECT COUNT(*) as count FROM coaches WHERE type != ?";
  const params: (number)[] = [CoachType.Pending];

  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params) as { count: number };
  return row?.count ?? 0;
}

// 获取待处理教练申请数量
function getPendingCoachesCount(campusId?: number): number {
  let query = "SELECT COUNT(*) as count FROM coaches WHERE type = ?";
  const params: (number)[] = [CoachType.Pending];

  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params) as { count: number };
  return row?.count ?? 0;
}

// 获取待处理预约数量
function getPendingAppointmentsCount(campusId?: number): number {
  let query = `
    SELECT COUNT(*) as count 
    FROM appointments a 
    JOIN coaches co ON a.coachId = co.id 
    WHERE a.status = ?`;
  const params: (number)[] = [AppointmentStatus.Pending];

  if (campusId !== undefined) {
    query += " AND co.campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params) as { count: number };
  return row?.count ?? 0;
}

// 获取待处理选择数量
function getPendingSelectionsCount(campusId?: number): number {
  let query = "SELECT COUNT(*) as count FROM selections WHERE status = ?";
  const params: (number)[] = [SelectionStatus.Pending];

  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params) as { count: number };
  return row?.count ?? 0;
}

// 获取待处理迁移数量
function getPendingMigrationsCount(campusId?: number): number {
  // 查找尚未完成且未被拒绝的迁移
  let query = `
    SELECT COUNT(*) as count 
    FROM migrations 
    WHERE status != ? AND status != ?`;
  const params: (number)[] = [
    MigrationStatus.Completed,
    MigrationStatus.Rejected,
  ];

  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params) as { count: number };
  return row?.count ?? 0;
}
