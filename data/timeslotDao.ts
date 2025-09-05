import { db } from "./db.ts";
import { Timeslot } from "../models/timeslot.ts"; // Import the existing Timeslot interface

export function getAllTimeslots(): (Timeslot & { campusName: string })[] {
  const stmt = db.prepare(`
    SELECT
      t.*,
      c.name AS campusName
    FROM
      timeslots t
    JOIN
      campuses c ON t.campusId = c.id
  `);
  return stmt.all() as (Timeslot & { campusName: string })[];
}

export function addTimeslot(timeslot: Omit<Timeslot, "id">) {
  const stmt = db.prepare(`
    INSERT INTO timeslots (weekday, startHour, startMinute, endHour, endMinute, campusId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    timeslot.weekday,
    timeslot.startHour,
    timeslot.startMinute,
    timeslot.endHour,
    timeslot.endMinute,
    timeslot.campusId,
  );
}

export function hasTimeslotOverlap(
  weekday: number,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  campusId: number,
): boolean {
  const newStartMinutes = startHour * 60 + startMinute;
  const newEndMinutes = endHour * 60 + endMinute;

  const stmt = db.prepare(`
    SELECT COUNT(*) FROM timeslots
    WHERE
      weekday = ? AND campusId = ? AND
      (
        (? < (endHour * 60 + endMinute)) AND
        (? > (startHour * 60 + startMinute))
      )
  `);
  const count = stmt.get(
    weekday,
    campusId,
    newStartMinutes,
    newEndMinutes,
  ) as { 'COUNT(*)': number };
  return count['COUNT(*)'] > 0;
}
