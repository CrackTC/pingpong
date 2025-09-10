import { db } from "./db.ts";
import { Deduction } from "../models/deduction.ts";

export function addDeduction(deduction: Omit<Deduction, "id">) {
  const stmt = db.prepare(
    "INSERT INTO deductions (studentId, type, amount, relatedId) VALUES (?, ?, ?, ?)",
  );
  stmt.run(
    deduction.studentId,
    deduction.type,
    deduction.amount,
    deduction.relatedId,
  );
}

export function getDeductionsByStudentId(studentId: number): Deduction[] {
  const stmt = db.prepare("SELECT * FROM deductions WHERE studentId = ?");
  return stmt.all(studentId) as Deduction[];
}
