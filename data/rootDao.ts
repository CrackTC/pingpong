import { Root } from "../models/root.ts";
import { db } from "./db.ts";

export function verifyRoot(username: string, password: string) {
  using stmt = db.prepare(
    "SELECT * FROM roots WHERE username = ? AND password = ?",
  );

  const row = stmt.get<Root>([username, password]);
  if (row) {
    return row.id;
  }
  return null;
}
