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

export function getDeductionByRelatedId(
  relatedId: number,
  type: DeductionType,
): Deduction | undefined {
  const stmt = db.prepare(
    "SELECT * FROM deductions WHERE relatedId = ? AND type = ?",
  );
  return stmt.get(relatedId, type) as Deduction | undefined;
}

export function deleteDeductionById(id: number) {
  const stmt = db.prepare("DELETE FROM deductions WHERE id = ?");
  stmt.run(id);
}

export function deleteDeductionsByStudentId(studentId: number) {
  const stmt = db.prepare("DELETE FROM deductions WHERE studentId = ?");
  stmt.run(studentId);
}

export function getEnrichedDeductionsByStudentId(
  studentId: number,
): (Deduction & { contestName?: string; appointmentDetails?: any })[] {
  const stmt = db.prepare(`
    SELECT
      d.*,
      co.name as contestName,
      a.id as appointmentId, a.coachId, a.tableId, a.timeslotId, a.status as appointmentStatus
    FROM
      deductions d
    LEFT JOIN
      contests co ON d.relatedId = co.id AND d.type = ?
    LEFT JOIN
      appointments a ON d.relatedId = a.id AND d.type = ?
    WHERE
      d.studentId = ?
  `);
  return stmt.all(
    DeductionType.ContestRegistration,
    DeductionType.Appointment,
    studentId,
  ) as (Deduction & { contestName?: string; appointmentDetails?: any })[];
}
