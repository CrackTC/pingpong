import { db } from "./db.ts";
import { Appointment, AppointmentStatus } from "../models/appointment.ts";

export function getAppointmentsByStudentId(studentId: number): Appointment[] {
  const stmt = db.prepare("SELECT * FROM appointments WHERE studentId = ?");
  return stmt.all(studentId) as Appointment[];
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
