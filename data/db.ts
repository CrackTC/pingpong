import { Database } from "@db/sqlite";

export const db = new Database("data.db", { int64: true });

db.exec(`
CREATE TABLE IF NOT EXISTS roots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL
)
`);

db.exec(`
INSERT INTO roots(username, password)
SELECT 'root', '123456'
WHERE NOT EXISTS(SELECT 1 FROM roots)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS campuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  type INTEGER NOT NULL
)
`);

db.exec(`
INSERT INTO campuses(name, address, phone, email, type)
SELECT '中心校区', '未填写', '未填写', '未填写', 1
WHERE NOT EXISTS(SELECT 1 FROM campuses)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campusId INTEGER NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  realName TEXT NOT NULL,
  sex INTEGER,
  birthYear INTEGER,
  campusId INTEGER NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  balance INTEGER NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS coaches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  realName TEXT NOT NULL,
  sex INTEGER,
  birthYear INTEGER,
  campusId INTEGER NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  avatarPath TEXT NOT NULL,
  comment TEXT NOT NULL,
  type INTEGER NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  campusId INTEGER NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS timeslots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weekday INTEGER NOT NULL,
  startHour INTEGER NOT NULL,
  startMinute INTEGER NOT NULL,
  endHour INTEGER NOT NULL,
  endMinute INTEGER NOT NULL,
  coachId INTEGER NOT NULL,
  FOREIGN KEY (coachId) REFERENCES coaches(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campusId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  coachId INTEGER NOT NULL,
  tableId INTEGER NOT NULL,
  timeslotId INTEGER NOT NULL,
  status INTEGER NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id),
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (coachId) REFERENCES coaches(id),
  FOREIGN KEY (tableId) REFERENCES tables(id),
  FOREIGN KEY (timeslotId) REFERENCES timeslots(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  coachId INTEGER NOT NULL,
  campusId INTEGER NOT NULL,
  status INTEGER NOT NULL,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (coachId) REFERENCES coaches(id),
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campusId INTEGER NOT NULL,
  selectionId INTEGER NOT NULL,
  destCoachId INTEGER NOT NULL,
  status INTEGER NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id),
  FOREIGN KEY (selectionId) REFERENCES selections(id),
  FOREIGN KEY (destCoachId) REFERENCES coaches(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campusId INTEGER NOT NULL,
  appointmentId INTEGER NOT NULL,
  type INTEGER NOT NULL,
  text TEXT,
  rating INTEGER,
  status INTEGER NOT NULL,
  FOREIGN KEY (campusId) REFERENCES campuses(id),
  FOREIGN KEY (appointmentId) REFERENCES appointments(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS systemLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campusId INTEGER NOT NULL,
  type INTEGER NOT NULL,
  text TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  relatedId INTEGER,
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campusId INTEGER NOT NULL,
  target INTEGER NOT NULL,
  targetId INTEGER NOT NULL,
  message TEXT NOT NULL,
  link TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0, -- Added field
  FOREIGN KEY (campusId) REFERENCES campuses(id)
)
`);
