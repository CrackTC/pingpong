import { db } from "./db.ts";
import { SystemLog } from "../models/systemLog.ts";

export function addSystemLog(log: Omit<SystemLog, "id" | "timestamp">) {
  const stmt = db.prepare(
    "INSERT INTO systemLogs (campusId, type, text, timestamp, relatedId) VALUES (?, ?, ?, ?, ?)",
  );
  stmt.run(log.campusId, log.type, log.text, Date.now(), log.relatedId);
}

export function getSystemLogs(campusId?: number): SystemLog[] {
  let query = "SELECT * FROM systemLogs";
  const params: (number)[] = [];

  if (campusId !== undefined) {
    query += " WHERE campusId = ?";
    params.push(campusId);
  }

  query += " ORDER BY timestamp DESC";

  const stmt = db.prepare(query);
  return stmt.all(...params) as SystemLog[];
}
