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

export function getMigrationsByStudentId(studentId: number): Migration[] {
  const stmt = db.prepare(
    `SELECT m.* FROM migrations m
     JOIN selections s ON m.selectionId = s.id
     WHERE s.studentId = ? AND m.status != ?`, // Exclude completed migrations
  );
  return stmt.all(studentId, MigrationStatus.Completed) as Migration[];
}
