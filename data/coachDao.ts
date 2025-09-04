import { Coach } from "../models/coach.ts";
import { db } from "./db.ts";
// import { Coach } from "../models/coach.ts"; // Uncomment if needed for other functions

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
