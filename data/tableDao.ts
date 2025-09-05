import { db } from "./db.ts";
import { Table } from "../models/table.ts";

export function addTable(tableData: Omit<Table, 'id'>) {
  const stmt = db.prepare(
    "INSERT INTO tables (name, campusId) VALUES (?, ?)",
  );
  stmt.run(
    tableData.name,
    tableData.campusId,
  );
}

export function getAllTables(campusId?: number): (Table & { campusName: string })[] {
  let query = `
    SELECT
      t.id,
      t.name,
      t.campusId,
      c.name AS campusName
    FROM
      tables t
    JOIN
      campuses c ON t.campusId = c.id
  `;
  const params: (number)[] = [];

  if (campusId !== undefined) {
    query += " WHERE t.campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  const result = stmt.all(...params);
  return result as (Table & { campusName: string })[];
}

export function getTableByNameAndCampusId(name: string, campusId: number): Table | undefined {
  const stmt = db.prepare("SELECT id, name, campusId FROM tables WHERE name = ? AND campusId = ?");
  const row = stmt.get(name, campusId);
  if (row) {
    return row as Table;
  }
  return undefined;
}
