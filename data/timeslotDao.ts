import { db } from "./db.ts";
import { Timeslot } from "../models/timeslot.ts"; // Import the existing Timeslot interface

export function getAllTimeslots(
  coachId?: number,
): (Timeslot & { coachName: string })[] {
  let query = `
    SELECT
      t.*,
      co.realName AS coachName
    FROM
      timeslots t
    JOIN
      coaches co ON t.coachId = co.id
  `;
  const params: (string | number)[] = [];

  if (coachId !== undefined) {
    query += " WHERE t.coachId = ?";
    params.push(coachId);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as (Timeslot & { coachName: string })[];
}

export function addTimeslot(timeslot: Omit<Timeslot, "id">) {
  const stmt = db.prepare(`
    INSERT INTO timeslots (weekday, startHour, startMinute, endHour, endMinute, coachId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    timeslot.weekday,
    timeslot.startHour,
    timeslot.startMinute,
    timeslot.endHour,
    timeslot.endMinute,
    timeslot.coachId,
  );
}

export function hasTimeslotOverlap(
  weekday: number,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  coachId: number,
): boolean {
  const newStartMinutes = startHour * 60 + startMinute;
  const newEndMinutes = endHour * 60 + endMinute;

  const stmt = db.prepare(`
    SELECT COUNT(*) FROM timeslots
    WHERE
      weekday = ? AND coachId = ? AND
      (
        (? < (endHour * 60 + endMinute)) AND
        (? > (startHour * 60 + startMinute))
      )
  `);
  const count = stmt.get(
    weekday,
    coachId,
    newStartMinutes,
    newEndMinutes,
  ) as { "COUNT(*)": number };
  return count["COUNT(*)"] > 0;
}

export function getTimeslotById(id: number): Timeslot | undefined {
  const stmt = db.prepare("SELECT * FROM timeslots WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    return row as Timeslot;
  }
  return undefined;
}

export function deleteTimeslotsByCoachId(coachId: number) {
  const stmt = db.prepare("DELETE FROM timeslots WHERE coachId = ?");
  stmt.run(coachId);
}
