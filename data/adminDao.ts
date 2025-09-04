import { db } from "./db.ts";
import { Admin } from "../models/admin.ts";

export function addAdmin(username: string, password: string, campusId: number) {
  const stmt = db.prepare(
    "INSERT INTO admins (campusId, username, password) VALUES (?, ?, ?)",
  );
  stmt.run(
    campusId,
    username,
    password,
  );
}

export function getAdminByUsername(username: string): Admin | undefined {
  const stmt = db.prepare("SELECT id, campusId as campus, username FROM admins WHERE username = ?");
  const row = stmt.get(username);
  if (row) {
    return row as Admin;
  }
}

export function getAllAdmins() {
  const stmt = db.prepare(
    "SELECT a.id, a.username, c.name as campusName FROM admins a JOIN campuses c ON a.campusId = c.id",
  );
  const rows = stmt.all();
  return rows;
}

export function verifyAdmin(
  username: string,
  password_input: string,
): number | undefined {
  const stmt = db.prepare(
    "SELECT id FROM admins WHERE username = ? AND password = ?",
  );
  const row = stmt.get<Admin>(username, password_input);
  if (row) {
    return row.id as number;
  }
  return undefined;
}
