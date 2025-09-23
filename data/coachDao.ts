import { db } from "./db.ts";
import { Coach, CoachType } from "../models/coach.ts";

export function verifyCoach(
  username: string,
  password_input: string,
): number | undefined {
  // ASSUMPTION: The 'coaches' table has a 'password' column.
  // If not, the authentication mechanism for coaches needs to be clarified.
  const stmt = db.prepare(
    "SELECT id FROM coaches WHERE username = ? AND password = ?",
  );
  const row = stmt.get<Coach>(username, password_input);
  if (row) {
    return row.id as number;
  }
  return undefined;
}

export function addCoach(
  coach: Omit<Coach, "id" | "type"> & { password: string; type?: CoachType },
): number {
  // ASSUMPTION: The 'coaches' table has a 'password' column.
  // The 'type' column will be initialized to CoachType.Pending (1) if not provided.
  const stmt = db.prepare(`
    INSERT INTO coaches (username, password, realName, sex, birthYear, campusId, phone, email, idCardNumber, avatarPath, comment, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    coach.username,
    coach.password,
    coach.realName,
    coach.sex,
    coach.birthYear,
    coach.campusId,
    coach.phone,
    coach.email,
    coach.idCardNumber,
    coach.avatarPath,
    coach.comment,
    coach.type ?? CoachType.Pending, // Use provided type or default to Pending
  );

  return db.prepare("SELECT last_insert_rowid() as id").get<{ id: number }>()
    ?.id ?? 0;
}

export function getCoachByUsername(username: string): Coach | undefined {
  const stmt = db.prepare(
    "SELECT id, username, realName, sex, birthYear, campusId, phone, email, idCardNumber, avatarPath, comment, type FROM coaches WHERE username = ?",
  );
  const row = stmt.get(username);
  if (row) {
    return row as Coach;
  }
}

export function getCoachById(
  id: number,
): (Coach & { campusName: string }) | undefined {
  const stmt = db.prepare(
    "SELECT co.id, co.username, co.realName, co.sex, co.birthYear, co.campusId, co.phone, co.email, co.idCardNumber, co.avatarPath, co.comment, co.type, ca.name as campusName FROM coaches co JOIN campuses ca ON co.campusId = ca.id WHERE co.id = ?",
  );
  const row = stmt.get(id);
  if (row) {
    return row as (Coach & { campusName: string });
  }
}

export function getPendingCoaches(
  campusId?: number,
): (Coach & { campusName: string })[] {
  try {
    // 明确指定字段而不是使用co.*，确保类型正确
    let query =
      "SELECT co.id, co.username, co.realName, co.sex, co.birthYear, co.campusId, co.phone, co.email, co.idCardNumber, co.avatarPath, co.comment, co.type, ca.name as campusName FROM coaches co JOIN campuses ca ON co.campusId = ca.id WHERE co.type = ?";
    const params: (string | number)[] = [CoachType.Pending];

    if (campusId !== undefined) {
      query += " AND co.campusId = ?";
      params.push(campusId);
    }

    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    // 确保返回的是数组
    return Array.isArray(result)
      ? (result as (Coach & { campusName: string })[])
      : [];
  } catch (error) {
    console.error("获取待处理教练时出错:", error);
    return [];
  }
}

export function approveCoach(coachId: number, type: CoachType) {
  const stmt = db.prepare("UPDATE coaches SET type = ? WHERE id = ?");
  stmt.run(type, coachId);
}

export function updateCoachPassword(id: number, newPassword: string) {
  const stmt = db.prepare("UPDATE coaches SET password = ? WHERE id = ?");
  stmt.run(newPassword, id);
}

export function updateCoachAvatarPath(id: number, avatarPath: string) {
  const stmt = db.prepare("UPDATE coaches SET avatarPath = ? WHERE id = ?");
  stmt.run(avatarPath, id);
}

export function updateCoach(id: number, data: {
  realName?: string;
  sex?: number | null;
  birthYear?: number | null;
  phone?: string;
  email?: string | null;
  idCardNumber?: string | null;
  comment?: string | null;
  type?: CoachType | null;
  avatarPath?: string;
}) {
  let query = "UPDATE coaches SET ";
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
  if (data.idCardNumber !== undefined) {
    updates.push("idCardNumber = ?");
    params.push(data.idCardNumber);
  }
  if (data.comment !== undefined) {
    updates.push("comment = ?");
    params.push(data.comment);
  }
  if (data.type !== undefined) {
    updates.push("type = ?");
    params.push(data.type);
  }
  if (data.avatarPath !== undefined) {
    updates.push("avatarPath = ?");
    params.push(data.avatarPath);
  }

  if (updates.length === 0) {
    return; // No fields to update
  }

  query += updates.join(", ") + " WHERE id = ?";
  params.push(id);

  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function searchCoaches(
  campusId: number,
  realName?: string,
  sex?: number,
  birthYear?: number,
): (Coach & { campusName: string })[] {
  let query =
    "SELECT co.id, co.username, co.realName, co.sex, co.birthYear, co.campusId, co.phone, co.email, co.idCardNumber, co.avatarPath, co.comment, co.type, ca.name as campusName FROM coaches co JOIN campuses ca ON co.campusId = ca.id WHERE co.campusId = ? AND co.type != ?";
  const params: (string | number)[] = [campusId, CoachType.Pending];

  if (realName) {
    query += " AND co.realName LIKE ?";
    params.push(`%${realName}%`);
  }
  if (sex) {
    query += " AND co.sex = ?";
    params.push(sex);
  }
  if (birthYear) {
    query += " AND co.birthYear = ?";
    params.push(birthYear);
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as (Coach & { campusName: string })[];
}

export function searchCoachesByIdCardOrPhone(
  query: string,
  campusId?: number,
): (Coach & { campusName: string })[] {
  let sql = `
    SELECT
      co.*,
      ca.name as campusName
    FROM
      coaches co
    JOIN
      campuses ca ON co.campusId = ca.id
    WHERE
      (co.idCardNumber = ? OR co.phone = ?)
  `;
  const params: (string | number)[] = [query, query];

  if (campusId !== undefined) {
    sql += " AND co.campusId = ?";
    params.push(campusId);
  }

  const stmt = db.prepare(sql);
  return stmt.all(...params) as (Coach & { campusName: string })[];
}

export function deleteCoachById(id: number) {
  const stmt = db.prepare("DELETE FROM coaches WHERE id = ?");
  stmt.run(id);
}
