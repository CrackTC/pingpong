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

export function calcDate(weekday: number, hour: number, minute: number) {
  const now = new Date();
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
