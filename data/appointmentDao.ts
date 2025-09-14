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

export function getAppointmentsByCoachId(coachId: number): (Appointment & {
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
      a.coachId = ?
  `);
  return stmt.all(coachId) as (Appointment & {
    studentName: string;
    tableName: string;
    weekday: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  })[];
}

export function getActiveAppointmentsByCoachId(
  coachId: number,
): (Appointment & { studentName: string; tableName: string })[] {
  const stmt = db.prepare(`
    SELECT
      a.*,
      s.realName AS studentName,
      t.name AS tableName
    FROM
      appointments a
    JOIN
      students s ON a.studentId = s.id
    JOIN
      tables t ON a.tableId = t.id
    WHERE
      a.coachId = ? AND a.status NOT IN (?, ?, ?, ?)
  `);
  return stmt.all(
    coachId,
    AppointmentStatus.StudentCancelled,
    AppointmentStatus.CoachCancelled,
    AppointmentStatus.Completed,
    AppointmentStatus.AdminCancelled,
  ) as (Appointment & { studentName: string; tableName: string })[];
}

export function getActiveAppointmentsByStudentId(
  studentId: number,
): (Appointment & { coachName: string; tableName: string })[] {
  const stmt = db.prepare(`
    SELECT
      a.*,
      co.realName AS coachName,
      t.name AS tableName
    FROM
      appointments a
    JOIN
      coaches co ON a.coachId = co.id
    JOIN
      tables t ON a.tableId = t.id
    WHERE
      a.studentId = ? AND a.status NOT IN (?, ?, ?, ?)
  `);
  return stmt.all(
    studentId,
    AppointmentStatus.StudentCancelled,
    AppointmentStatus.CoachCancelled,
    AppointmentStatus.Completed,
    AppointmentStatus.AdminCancelled,
  ) as (Appointment & { coachName: string; tableName: string })[];
}

export function getAllActiveAppointments(): Appointment[] {
  const stmt = db.prepare(
    "SELECT * FROM appointments WHERE status NOT IN (?, ?, ?, ?)",
  );
  return stmt.all(
    AppointmentStatus.StudentCancelled,
    AppointmentStatus.CoachCancelled,
    AppointmentStatus.Completed,
    AppointmentStatus.AdminCancelled,
  ) as Appointment[];
}

export function addAppointment(appointment: Omit<Appointment, "id">) {
  const stmt = db.prepare(
    "INSERT INTO appointments (campusId, studentId, coachId, tableId, timeslotId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  stmt.run(
    appointment.campusId,
    appointment.studentId,
    appointment.coachId,
    appointment.tableId,
    appointment.timeslotId,
    appointment.status,
    appointment.createdAt,
  );
}

export function getPendingAppointmentsByCoachId(
  coachId: number,
): (Appointment & {
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

export function getAppointmentById(id: number):
  | (Appointment & {
    weekday: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    coachName: string;
    tableName: string;
  })
  | undefined {
  const stmt = db.prepare(`
    SELECT
      a.*,
      ts.weekday,
      ts.startHour,
      ts.startMinute,
      ts.endHour,
      ts.endMinute,
      c.realName as coachName,
      t.name as tableName
    FROM
      appointments a
    JOIN
      timeslots ts ON a.timeslotId = ts.id
    JOIN
      coaches c ON a.coachId = c.id
    JOIN
      tables t ON a.tableId = t.id
    WHERE
      a.id = ?
  `);
  return stmt.get(id) as
    | (Appointment & {
      weekday: number;
      startHour: number;
      startMinute: number;
      endHour: number;
      endMinute: number;
      coachName: string;
      tableName: string;
    })
    | undefined;
}

export function getStudentCancellingAppointmentsByCoachId(
  coachId: number,
): (Appointment & {
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
  return stmt.all(
    coachId,
    AppointmentStatus.StudentCancelling,
  ) as (Appointment & {
    studentName: string;
    tableName: string;
    weekday: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  })[];
}

export function getCoachCancellingAppointmentsByStudentId(
  studentId: number,
): (Appointment & {
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
      c.realName AS coachName,
      t.name AS tableName,
      ts.weekday,
      ts.startHour,
      ts.startMinute,
      ts.endHour,
      ts.endMinute
    FROM
      appointments a
    JOIN
      coaches c ON a.coachId = c.id
    JOIN
      tables t ON a.tableId = t.id
    JOIN
      timeslots ts ON a.timeslotId = ts.id
    WHERE
      a.studentId = ? AND a.status = ?
  `);
  return stmt.all(
    studentId,
    AppointmentStatus.CoachCancelling,
  ) as (Appointment & {
    coachName: string;
    tableName: string;
    weekday: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  })[];
}

export function deleteAppointmentsByCoachId(coachId: number) {
  const stmt = db.prepare("DELETE FROM appointments WHERE coachId = ?");
  stmt.run(coachId);
}

export function deleteAppointmentsByStudentId(studentId: number) {
  const stmt = db.prepare("DELETE FROM appointments WHERE studentId = ?");
  stmt.run(studentId);
}
