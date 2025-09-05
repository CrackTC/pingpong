import { db } from "./db.ts";
import { Appointment, AppointmentStatus } from "../models/appointment.ts";

export function getAppointmentsByStudentId(studentId: number): (Appointment & {
  coachName: string;
  tableName: string;
  weekday: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
})[] {
  const stmt = db.prepare(`
    SELECT
      a.*,
      co.realName AS coachName,
      t.name AS tableName,
      ts.weekday,
      ts.startHour,
      ts.startMinute,
      ts.endHour,
      ts.endMinute
    FROM
      appointments a
    JOIN
      coaches co ON a.coachId = co.id
    JOIN
      tables t ON a.tableId = t.id
    JOIN
      timeslots ts ON a.timeslotId = ts.id
    WHERE
      a.studentId = ?
  `);
  return stmt.all(studentId) as (Appointment & {
    coachName: string;
    tableName: string;
    weekday: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  })[];
}

export function getAppointmentsByCoachId(coachId: number): Appointment[] {
  const stmt = db.prepare("SELECT * FROM appointments WHERE coachId = ?");
  return stmt.all(coachId) as Appointment[];
}

export function getActiveAppointmentsByCoachId(coachId: number): Appointment[] {
  const stmt = db.prepare(
    "SELECT * FROM appointments WHERE coachId = ? AND status NOT IN (?, ?)",
  );
  return stmt.all(
    coachId,
    AppointmentStatus.StudentCancelled,
    AppointmentStatus.CoachCancelled,
  ) as Appointment[];
}

export function getAllActiveAppointments(): Appointment[] {
  const stmt = db.prepare("SELECT * FROM appointments WHERE status NOT IN (?, ?)");
  return stmt.all(AppointmentStatus.StudentCancelled, AppointmentStatus.CoachCancelled) as Appointment[];
}

export function addAppointment(appointment: Omit<Appointment, "id">) {
  const stmt = db.prepare(
    "INSERT INTO appointments (campusId, studentId, coachId, tableId, timeslotId, status) VALUES (?, ?, ?, ?, ?, ?)"
  );
  stmt.run(
    appointment.campusId,
    appointment.studentId,
    appointment.coachId,
    appointment.tableId,
    appointment.timeslotId,
    appointment.status
  );
}

export function getPendingAppointmentsByCoachId(coachId: number): (Appointment & {
  studentName: string;
  tableName: string;
  weekday: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
})[] {
  const stmt = db.prepare(`
    SELECT
      a.*,
      s.realName AS studentName,
      t.name AS tableName,
      ts.weekday,
      ts.startHour,
      ts.startMinute,
      ts.endHour,
      ts.endMinute
    FROM
      appointments a
    JOIN
      students s ON a.studentId = s.id
    JOIN
      tables t ON a.tableId = t.id
    JOIN
      timeslots ts ON a.timeslotId = ts.id
    WHERE
      a.coachId = ? AND a.status = ?
  `);
  return stmt.all(coachId, AppointmentStatus.Pending) as (Appointment & {
    studentName: string;
    tableName: string;
    weekday: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  })[];
}

export function updateAppointmentStatus(id: number, status: AppointmentStatus) {
  const stmt = db.prepare("UPDATE appointments SET status = ? WHERE id = ?");
  stmt.run(status, id);
}
