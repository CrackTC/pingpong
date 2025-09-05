import { db } from "./db.ts";
import { SelectionStatus } from "../models/selection.ts";
import { Student } from "../models/student.ts";

export function addSelection(studentId: number, coachId: number, campusId: number, status: SelectionStatus) {
  const stmt = db.prepare("INSERT INTO selections (studentId, coachId, campusId, status) VALUES (?, ?, ?, ?)");
  stmt.run(studentId, coachId, campusId, status);
}

export function getSelectionCountForCoach(coachId: number): number {
  const stmt = db.prepare("SELECT COUNT(*) FROM selections WHERE coachId = ? AND status = ?");
  const count = stmt.get(coachId, SelectionStatus.Approved) as { 'COUNT(*)': number };
  return count['COUNT(*)'];
}

export function getActiveSelectionCountForStudent(studentId: number): number {
  const stmt = db.prepare("SELECT COUNT(*) as count FROM selections WHERE studentId = ? AND (status = ? OR status = ?)");
  const row = stmt.get(studentId, SelectionStatus.Pending, SelectionStatus.Approved);
  return (row as { count: number }).count;
}

export function getPendingSelectionsForCoach(coachId: number): any[] {
  const stmt = db.prepare(`
    SELECT
      s.id,
      s.studentId,
      s.coachId,
      s.status,
      st.realName AS studentRealName,
      st.sex AS studentSex,
      st.birthYear AS studentBirthYear,
      st.phone AS studentPhone,
      st.email AS studentEmail
    FROM
      selections s
    JOIN
      students st ON s.studentId = st.id
    WHERE
      s.coachId = ? AND s.status = ?
  `);
  return stmt.all(coachId, SelectionStatus.Pending);
}

export function updateSelectionStatus(selectionId: number, status: SelectionStatus) {
  const stmt = db.prepare("UPDATE selections SET status = ? WHERE id = ?");
  stmt.run(status, selectionId);
}

import { Selection } from "../models/selection.ts";

export function getSelectionById(selectionId: number): Selection | undefined {
  const stmt = db.prepare("SELECT * FROM selections WHERE id = ?");
  const row = stmt.get(selectionId);
  if (row) {
    return row as Selection;
  }
  return undefined;
}

export function getActiveSelectionForStudent(studentId: number): any | undefined {
  const stmt = db.prepare(`
    SELECT
      s.id AS selectionId,
      s.status AS selectionStatus,
      co.id AS coachId,
      co.username AS coachUsername,
      co.realName AS coachRealName,
      co.sex AS coachSex,
      co.birthYear AS coachBirthYear,
      co.campusId AS coachCampusId,
      co.phone AS coachPhone,
      co.email AS coachEmail,
      co.avatarPath AS coachAvatarPath,
      co.comment AS coachComment,
      co.type AS coachType,
      ca.name AS coachCampusName
    FROM
      selections s
    JOIN
      coaches co ON s.coachId = co.id
    JOIN
      campuses ca ON co.campusId = ca.id
    WHERE
      s.studentId = ? AND (s.status = ? OR s.status = ?)
  `);
  const row = stmt.get(studentId, SelectionStatus.Pending, SelectionStatus.Approved);
  if (row) {
    return {
      selection: {
        id: row.selectionId,
        status: row.selectionStatus,
      },
      coach: {
        id: row.coachId,
        username: row.coachUsername,
        realName: row.coachRealName,
        sex: row.coachSex,
        birthYear: row.coachBirthYear,
        campusId: row.coachCampusId,
        phone: row.coachPhone,
        email: row.coachEmail,
        avatarPath: row.coachAvatarPath,
        comment: row.coachComment,
        type: row.coachType,
        campusName: row.coachCampusName,
      }
    };
  }
  return undefined;
}

export function getStudentsByCoachId(coachId: number): Student[] {
  const stmt = db.prepare(`
    SELECT DISTINCT s.id, s.username, s.realName, s.sex, s.birthYear, s.campusId, s.phone, s.email
    FROM students s
    JOIN selections sel ON s.id = sel.studentId
    WHERE sel.coachId = ? AND sel.status = ?
  `);
  return stmt.all(coachId, SelectionStatus.Approved) as Student[];
}

export function getSelectionByStudentAndCoachId(studentId: number, coachId: number): Selection | undefined {
  const stmt = db.prepare("SELECT * FROM selections WHERE studentId = ? AND coachId = ? AND (status = ? OR status = ?)");
  const row = stmt.get(studentId, coachId, SelectionStatus.Pending, SelectionStatus.Approved);
  if (row) {
    return row as Selection;
  }
  return undefined;
}
