import { db } from "./db.ts";
import { Contest, ContestType } from "../models/contest.ts";

export function getLastContests(limit: number): Contest[] {
  const stmt = db.prepare(`
    SELECT *
    FROM contests
    ORDER BY id DESC
    LIMIT ?
  `);
  return stmt.all(limit) as Contest[];
}

export function addContest(
  name: string,
  type: ContestType,
  time: number,
): number {
  const stmt = db.prepare(`
    INSERT INTO contests (name, type, time)
    VALUES (?, ?, ?)
  `);
  stmt.run(name, type, time);
  return db.prepare("SELECT last_insert_rowid() as id").get<{ id: number }>()
    ?.id ?? 0;
}

export function getContestById(id: number): Contest | undefined {
  const stmt = db.prepare("SELECT * FROM contests WHERE id = ?");
  return stmt.get(id) as Contest | undefined;
}
