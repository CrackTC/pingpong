import { db } from "./db.ts";
import { Campus } from "../models/campus.ts";

export function addCampus(campus: Omit<Campus, "id">) {
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
