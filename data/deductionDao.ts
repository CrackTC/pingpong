import { db } from "./db.ts";
import { Deduction, DeductionType } from "../models/deduction.ts";

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

export function getDeductionByRelatedId(relatedId: number, type: DeductionType): Deduction | undefined {
  const stmt = db.prepare("SELECT * FROM deductions WHERE relatedId = ? AND type = ?");
  return stmt.get(relatedId, type) as Deduction | undefined;
}

export function deleteDeductionById(id: number) {
  const stmt = db.prepare("DELETE FROM deductions WHERE id = ?");
  stmt.run(id);
}
