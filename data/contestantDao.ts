import { db } from "./db.ts";

export function addContestant(
  studentId: number,
  contestId: number,
): number {
  const seqStmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM contestants
    WHERE contestId = ?
  `);
  const seq = seqStmt.get<{ count: number }>(contestId)?.count ?? 0;
  const stmt = db.prepare(`
    INSERT INTO contestants (seq, studentId, contestId)
    VALUES (?, ?, ?)
  `);
  stmt.run(seq, studentId, contestId);
  return seq;
}

export function getContestantsByContestId(
  contestId: number,
): { seq: number; studentId: number }[] {
  const stmt = db.prepare(`
    SELECT seq, studentId
    FROM contestants
    WHERE contestId = ?
    ORDER BY seq ASC
  `);
  return stmt.all(contestId) as { seq: number; studentId: number }[];
}

export function hasStudentRegisteredForMonth(
  studentId: number,
  year: number,
  month: number,
): boolean {
  const startOfMonth = new Date(year, month, 1).getTime();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

  const stmt = db.prepare(`
    SELECT COUNT(*)
    FROM contestants c
    JOIN contests co ON c.contestId = co.id
    WHERE c.studentId = ?
      AND co.time >= ?
      AND co.time <= ?
  `);
  const result = stmt.get(
    studentId,
    startOfMonth,
    endOfMonth,
  ) as { "COUNT(*)": number };
  return result["COUNT(*)"] > 0;
}
