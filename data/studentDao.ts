import { Student } from "../models/student.ts";
import { db } from "./db.ts";
// import { Student } from "../models/student.ts"; // Uncomment if needed for other functions

export function verifyStudent(
  username: string,
  password_input: string,
): number | undefined {
  // ASSUMPTION: The 'students' table has a 'password' column.
  // If not, the authentication mechanism for students needs to be clarified.
  const stmt = db.prepare(
    "SELECT id FROM students WHERE username = ? AND password = ?",
  );
  const row = stmt.get<Student>(username, password_input);
  if (row) {
    return row.id as number;
  }
  return undefined;
}

export function addStudent(
  student: Omit<Student, "id" | "balance"> & { password: string },
): number {
  // ASSUMPTION: The 'students' table has a 'password' column.
  // The 'balance' column will be initialized to 0.
  const stmt = db.prepare(
    "INSERT INTO students (username, password, realName, sex, birthYear, campusId, phone, email, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  stmt.run(
    student.username,
    student.password,
    student.realName,
    student.sex,
    student.birthYear,
    student.campusId,
    student.phone,
    student.email,
    0, // Always set balance to 0
  );
  return db.prepare("SELECT last_insert_rowid() as id").get<{ id: number }>()
    ?.id ?? 0;
}

export function getStudentByUsername(username: string): Student | undefined {
  const stmt = db.prepare(
    "SELECT id, username, realName, sex, birthYear, campusId, phone, email, balance FROM students WHERE username = ?",
  );
  const row = stmt.get(username);
  if (row) {
    return row as Student;
  }
}

export function getStudentById(
  id: number,
): (Student & { campusName: string }) | undefined {
  const stmt = db.prepare(
    "SELECT s.id, s.username, s.realName, s.sex, s.birthYear, s.campusId, s.phone, s.email, s.balance, c.name as campusName FROM students s JOIN campuses c ON s.campusId = c.id WHERE s.id = ?",
  );
  const row = stmt.get(id);
  if (row) {
    return row as (Student & { campusName: string });
  }
}

export function updateStudentPassword(id: number, newPassword: string) {
  const stmt = db.prepare("UPDATE students SET password = ? WHERE id = ?");
  stmt.run(newPassword, id);
}

export function updateStudent(id: number, data: {
  realName?: string;
  sex?: number | null;
  birthYear?: number | null;
  phone?: string;
  email?: string | null;
}) {
  let query = "UPDATE students SET ";
  const params: (string | number | null)[] = [];
  const updates: string[] = [];

  if (data.realName !== undefined) {
    updates.push("realName = ?");
    params.push(data.realName);
  }
  if (data.sex !== undefined) {
    updates.push("sex = ?");
    params.push(data.sex);
  }
  if (data.birthYear !== undefined) {
    updates.push("birthYear = ?");
    params.push(data.birthYear);
  }
  if (data.phone !== undefined) {
    updates.push("phone = ?");
    params.push(data.phone);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    params.push(data.email);
  }

  if (updates.length === 0) {
    return; // No fields to update
  }

  query += updates.join(", ") + " WHERE id = ?";
  params.push(id);

  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function getStudentByPhoneAndCampus(
  phone: string,
  campusId: number,
  excludeStudentId?: number,
): Student | undefined {
  let query =
    "SELECT id, username, realName, sex, birthYear, campusId, phone, email, balance FROM students WHERE phone = ? AND campusId = ?";
  const params: (string | number | null)[] = [phone, campusId];

  if (excludeStudentId !== undefined) {
    query += " AND id != ?";
    params.push(excludeStudentId);
  }

  const stmt = db.prepare(query);
  const row = stmt.get(...params);
  if (row) {
    return row as Student;
  }
  return undefined;
}

export function searchStudentsByPhone(
  phone: string,
  campusId?: number,
): (Student & { campusName: string })[] {
  let query = `
    SELECT
      s.*,
      c.name as campusName
    FROM
      students s
    JOIN
      campuses c ON s.campusId = c.id
    WHERE
      s.phone = ?
  `;
  const params: (string | number)[] = [phone];

  if (campusId !== undefined) {
    query += " AND s.campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as (Student & { campusName: string })[];
}

export function updateStudentBalance(id: number, amount: number): void {
  const stmt = db.prepare(
    "UPDATE students SET balance = balance + ? WHERE id = ?",
  );
  stmt.run(amount, id);
}

export function deleteStudentById(id: number) {
  const stmt = db.prepare("DELETE FROM students WHERE id = ?");
  stmt.run(id);
}
