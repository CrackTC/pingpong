import { db } from "./db.ts";
import { NotificationTarget } from "../models/notification.ts";
import { Notification } from "../models/notification.ts"; // Import Notification type

export function addNotification(
  campusId: number,
  target: NotificationTarget,
  targetId: number,
  message: string,
  link: string,
  timestamp: number,
) {
  const stmt = db.prepare(
    "INSERT INTO notifications (campusId, target, targetId, message, link, timestamp, isRead) VALUES (?, ?, ?, ?, ?, ?, 0)",
  ); // Set isRead to 0 (false) by default
  stmt.run(campusId, target, targetId, message, link, timestamp);
}

export function getNotificationsForUser(
  userId: number,
  targetType: NotificationTarget,
): Notification[] {
  const stmt = db.prepare(
    "SELECT id, campusId, target, targetId, message, link, timestamp, isRead FROM notifications WHERE targetId = ? AND target = ? ORDER BY timestamp DESC",
  );
  return stmt.all(userId, targetType) as Notification[];
}

export function getNotificationsForAdmin(campusId?: number): Notification[] {
  let query =
    "SELECT id, campusId, target, targetId, message, link, timestamp, isRead FROM notifications WHERE target = ?";
  const params: number[] = [NotificationTarget.Admin];
  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  query += " ORDER BY timestamp DESC";
  const stmt = db.prepare(query);
  return stmt.all(...params) as Notification[];
}

export function markNotificationAsRead(notificationId: number) {
  const stmt = db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?");
  stmt.run(notificationId);
}

export function getNotificationById(
  notificationId: number,
): Notification | undefined {
  const stmt = db.prepare(
    "SELECT id, campusId, target, targetId, message, link, timestamp, isRead FROM notifications WHERE id = ?",
  );
  const row = stmt.get(notificationId);
  if (row) {
    return row as Notification;
  }
  return undefined;
}

export function getUnreadNotificationCountForUser(
  userId: number,
  targetType: NotificationTarget,
): number {
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM notifications WHERE targetId = ? AND target = ? AND isRead = 0",
  );
  const row = stmt.get(userId, targetType);
  return (row as { count: number }).count;
}

export function getUnreadNotificationCountForAdmin(
  campusId?: number,
): number {
  let query =
    "SELECT COUNT(*) as count FROM notifications WHERE target = ? AND isRead = 0";
  const params: number[] = [NotificationTarget.Admin];
  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params);
  return (row as { count: number }).count;
}
