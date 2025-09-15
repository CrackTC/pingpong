import { Match } from "../models/match.ts";
import { db } from "./db.ts";

export function addMatch(
  match: Match,
): void {
  const stmt = db.prepare(`
    INSERT INTO matches (contestId, round, seqA, seqB, tableId)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(match.contestId, match.round, match.seqA, match.seqB, match.tableId);
}

export function getMatchesByStudentId(
  studentId: number,
): (Match & { tableName: string; opponentSeq: number | null })[] {
  const stmt = db.prepare(`
    SELECT
      m.*,
      t.name AS tableName,
      CASE
        WHEN cA.studentId = ? THEN m.seqB
        WHEN cB.studentId = ? THEN m.seqA
        ELSE NULL
      END AS opponentSeq
    FROM
      matches m
    JOIN
      tables t ON m.tableId = t.id
    LEFT JOIN
      contestants cA ON m.contestId = cA.contestId AND m.seqA = cA.seq
    LEFT JOIN
      contestants cB ON m.contestId = cB.contestId AND m.seqB = cB.seq
    WHERE
      cA.studentId = ? OR cB.studentId = ?
  `);
  return stmt.all(
    studentId,
    studentId,
    studentId,
    studentId,
  ) as (Match & { tableName: string; opponentSeq: number | null })[];
}
