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
) {
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
}

export function getStudentByUsername(username: string): Student | undefined {
  const stmt = db.prepare("SELECT id, username, realName, sex, birthYear, campusId, phone, email, balance FROM students WHERE username = ?");
  const row = stmt.get(username);
  if (row) {
    return row as Student;
  }
}

export function getStudentById(id: number): Student | undefined {
  const stmt = db.prepare("SELECT id, username, realName, sex, birthYear, campusId, phone, email, balance FROM students WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    return row as Student;
  }
}
