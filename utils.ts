import { CronJob } from "cron";

export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 16) {
    return "Password must be between 8 and 16 characters long.";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one alphabet character.";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special symbol.";
  }
  return null; // Password is valid
}

export function calcDate(
  start: number,
  weekday: number,
  hour: number,
  minute: number,
) {
  const now = new Date(start);
  const ans = new Date(now);
  ans.setHours(hour, minute, 0, 0);

  let diff = weekday - now.getDay();
  if (diff < 0 || (diff === 0 && ans.getTime() < now.getTime())) {
    diff += 7;
  }
  ans.setDate(now.getDate() + diff);
  return ans;
}

export function scheduleTask(task: () => void, date: Date) {
  new CronJob(date, task).start();
}

export function getRoundInfo(people: number) {
  if (people < 2) {
    return [];
  }

  const n = people % 2 === 0 ? people : people + 1; // Ensure even number of participants
  const arr = Array.from({ length: n }, (_, i) => i);
  const rounds = [];

  for (let round = 0; round < n - 1; round++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home < people && away < people) {
        if (home < away) {
          matches.push([home, away]);
        } else {
          matches.push([away, home]);
        }
      }
    }
    rounds.push(matches);
    // Rotate the array for the next round
    arr.splice(1, 0, arr.pop()!);
  }

  return rounds;
}
