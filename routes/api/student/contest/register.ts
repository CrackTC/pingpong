import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  addContestant,
  hasStudentRegisteredForMonth,
} from "../../../../data/contestantDao.ts";
import { getContestById } from "../../../../data/contestDao.ts";

export function useApiStudentContestRegister(app: Hono) {
  app.post("/api/student/contest/register", async (c) => {
    const { contestId } = await c.req.json();
    const claim = await getClaim(c);
    const studentId = claim.id;

    if (isNaN(contestId)) {
      return c.json({ message: "Invalid contest ID." }, 400);
    }

    try {
      const contest = getContestById(contestId);
      if (!contest) {
        return c.json({ message: "Contest not found." }, 404);
      }

      const contestDate = new Date(contest.time);
      const year = contestDate.getFullYear();
      const month = contestDate.getMonth();

      if (hasStudentRegisteredForMonth(studentId, year, month)) {
        return c.json({
          message: "You have already registered for a contest this month.",
        }, 400);
      }

      addContestant(studentId, contestId);

      return c.json({ message: "Registration successful!" });
    } catch (error) {
      console.error("Error registering for contest:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
