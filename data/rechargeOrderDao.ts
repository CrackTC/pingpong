import { db } from "./db.ts";
import { RechargeOrder, RechargeOrderStatus } from "../models/rechargeOrder.ts";

export function addRechargeOrder(order: Omit<RechargeOrder, "id">): void {
  const stmt = db.prepare(
    "INSERT INTO recharge_orders (orderNumber, studentId, amount, status) VALUES (?, ?, ?, ?)",
  );
  stmt.run(order.orderNumber, order.studentId, order.amount, order.status);
}

export function getRechargeOrderByOrderNumber(orderNumber: string): RechargeOrder | undefined {
  const stmt = db.prepare("SELECT * FROM recharge_orders WHERE orderNumber = ?");
  return stmt.get(orderNumber) as RechargeOrder | undefined;
}

export function updateRechargeOrderStatus(orderNumber: string, status: RechargeOrderStatus): void {
  const stmt = db.prepare("UPDATE recharge_orders SET status = ? WHERE orderNumber = ?");
  stmt.run(status, orderNumber);
}

export function getRechargeOrdersByStudentId(studentId: number): RechargeOrder[] {
    const stmt = db.prepare("SELECT * FROM recharge_orders WHERE studentId = ? ORDER BY id DESC");
    return stmt.all(studentId) as RechargeOrder[];
}
