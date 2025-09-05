import { db } from "./db.ts";
import { Table } from "../models/table.ts";
import { Timeslot } from "../models/timeslot.ts";
import { getAllActiveAppointments } from "./appointmentDao.ts";
import { getTimeslotById } from "./timeslotDao.ts";

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

export function getAvailableTables(campusId: number, timeslot: Timeslot): Table[] {
  const allTables = getAllTables(campusId);
  const activeAppointments = getAllActiveAppointments();

  const conflictingAppointments = activeAppointments.filter(appointment => {
    const appointmentTimeslot = getTimeslotById(appointment.timeslotId);
    if (!appointmentTimeslot || appointment.campusId !== campusId || appointmentTimeslot.weekday !== timeslot.weekday) {
      return false;
    }

    const start1 = timeslot.startHour * 60 + timeslot.startMinute;
    const end1 = timeslot.endHour * 60 + timeslot.endMinute;
    const start2 = appointmentTimeslot.startHour * 60 + appointmentTimeslot.startMinute;
    const end2 = appointmentTimeslot.endHour * 60 + appointmentTimeslot.endMinute;

    // Check for overlap
    return start1 < end2 && start2 < end1;
  });

  const bookedTableIds = new Set(conflictingAppointments.map(a => a.tableId));

  return allTables.filter(table => !bookedTableIds.has(table.id));
}

export function getTableById(id: number): Table | undefined {
  const stmt = db.prepare("SELECT * FROM tables WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    return row as Table;
  }
  return undefined;
}
