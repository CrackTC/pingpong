import { db } from "./db.ts";
import { Migration, MigrationStatus } from "../models/migration.ts";

export function addMigration(migration: Omit<Migration, "id">) {
  const stmt = db.prepare(
    "INSERT INTO migrations (campusId, selectionId, destCoachId, status) VALUES (?, ?, ?, ?)",
  );
  stmt.run(
    migration.campusId,
    migration.selectionId,
    migration.destCoachId,
    migration.status,
  );
}

export function getMigrationsByStudentId(
  studentId: number,
): (Migration & { originCoachName: string; destCoachName: string })[] {
  const stmt = db.prepare(
    `SELECT m.*, oco.realName AS originCoachName, dco.realName AS destCoachName FROM migrations m
     JOIN selections s ON m.selectionId = s.id
     JOIN coaches oco ON s.coachId = oco.id
     JOIN coaches dco ON m.destCoachId = dco.id
     WHERE s.studentId = ? AND m.status != ?`, // Exclude completed migrations
  );
  return stmt.all(
    studentId,
    MigrationStatus.Completed,
  ) as (Migration & { originCoachName: string; destCoachName: string })[];
}

export function getPendingMigrations(
  status: MigrationStatus,
  campusId?: number,
) {
  let query = `
    SELECT
      oco.id AS originCoachId,
      oco.realName AS originCoachName,
      dco.id AS destCoachId,
      dco.realName AS destCoachName,
      stu.id AS studentId,
      stu.realName AS studentName,
      m.status,
      m.id AS migrationId
    FROM migrations m
    JOIN selections sel ON m.selectionId = sel.id
    JOIN coaches oco ON sel.coachId = oco.id
    JOIN coaches dco ON m.destCoachId = dco.id
    JOIN students stu ON sel.studentId = stu.id
    WHERE (m.status & ?) = 0 AND m.status != ?
  `;

  const params = [status, MigrationStatus.Rejected];
  if (campusId !== undefined) {
    query += " AND campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export function updateMigrationStatus(
  migrationId: number,
  status: MigrationStatus,
) {
  const stmt = db.prepare("UPDATE migrations SET status = ? WHERE id = ?");
  stmt.run(status, migrationId);
}

export function getMigrationById(id: number): Migration | undefined {
  const stmt = db.prepare("SELECT * FROM migrations WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    return row as Migration;
  }
  return undefined;
}

export function getPendingMigrationsForCoach(
  coachId: number,
): (Migration & { studentName: string; originCoachName: string })[] {
  const stmt = db.prepare(`
    SELECT
      m.*,
      s.realName AS studentName,
      oco.realName AS originCoachName,
      dco.realName AS destCoachName
    FROM
      migrations m
    JOIN
      selections sel ON m.selectionId = sel.id
    JOIN
      students s ON sel.studentId = s.id
    JOIN
      coaches oco ON sel.coachId = oco.id
    JOIN
      coaches dco ON m.destCoachId = dco.id
    WHERE
      m.status != ? AND ((m.destCoachId = ? AND (m.status & ?) = 0) OR (oco.id = ? AND (m.status & ?) = 0))
  `);
  return stmt.all(
    MigrationStatus.Rejected,
    coachId,
    MigrationStatus.DestCoachApproved,
    coachId,
    MigrationStatus.OriginCoachApproved,
  ) as (Migration & { studentName: string; originCoachName: string })[];
}
