import { db } from "./db.ts";
import { RechargeOrder, RechargeOrderStatus } from "../models/rechargeOrder.ts";

export function addRechargeOrder(order: Omit<RechargeOrder, "id">): number {
  const stmt = db.prepare(
    "INSERT INTO recharge_orders (orderNumber, studentId, amount, status) VALUES (?, ?, ?, ?)",
  );
  stmt.run(order.orderNumber, order.studentId, order.amount, order.status);
  return db.prepare("SELECT last_insert_rowid() as id").get<{ id: number }>()
    ?.id ?? 0;
}

export function getRechargeOrderByOrderNumber(
  orderNumber: string,
): RechargeOrder | undefined {
  const stmt = db.prepare(
    "SELECT * FROM recharge_orders WHERE orderNumber = ?",
  );
  return stmt.get(orderNumber) as RechargeOrder | undefined;
}

export function updateRechargeOrderStatus(
  orderNumber: string,
  status: RechargeOrderStatus,
): void {
  const stmt = db.prepare(
    "UPDATE recharge_orders SET status = ? WHERE orderNumber = ?",
  );
  stmt.run(status, orderNumber);
}

import { SystemLogType } from "../models/systemLog.ts";

export function getRechargeOrdersByStudentId(
  studentId: number,
): (RechargeOrder & { createdAt: number })[] {
  const stmt = db.prepare(`
    SELECT
      ro.*,
      sl.timestamp as createdAt
    FROM
      recharge_orders ro
    LEFT JOIN
      systemLogs sl ON ro.id = sl.relatedId AND sl.type = ?
    WHERE
      ro.studentId = ?
    ORDER BY
      ro.id DESC
  `);
  return stmt.all(
    SystemLogType.StudentRecharge,
    studentId,
  ) as (RechargeOrder & { createdAt: number })[];
}

export function deleteRechargeOrdersByStudentId(studentId: number) {
  const stmt = db.prepare("DELETE FROM recharge_orders WHERE studentId = ?");
  stmt.run(studentId);
}
