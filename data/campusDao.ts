import { db } from "./db.ts";
import { Campus } from "../models/campus.ts";

export function addCampus(campus: Omit<Campus, "id">): number {
  const stmt = db.prepare(
    "INSERT INTO campuses (name, address, phone, email, type) VALUES (?, ?, ?, ?, ?)",
  );
  stmt.run(
    campus.name,
    campus.address,
    campus.phone,
    campus.email,
    campus.type,
  );
  return db.prepare("SELECT last_insert_rowid() as id").get<{ id: number }>()
    ?.id ?? 0;
}

export function getCampusByName(name: string): Campus | undefined {
  const stmt = db.prepare("SELECT * FROM campuses WHERE name = ?");
  const row = stmt.get(name);
  if (row) {
    return row as Campus;
  }
}

export function getAllCampuses(): Campus[] {
  const stmt = db.prepare("SELECT * FROM campuses");
  return stmt.all() as Campus[];
}

export function getCampusById(id: number): Campus | undefined {
  const stmt = db.prepare("SELECT * FROM campuses WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    return row as Campus;
  }
}
