import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import {
  addContestant,
  hasStudentRegisteredForMonth,
} from "../../../../data/contestantDao.ts";
import { getContestById } from "../../../../data/contestDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import {
  getStudentById,
  updateStudentBalance,
} from "../../../../data/studentDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";
import { addDeduction } from "../../../../data/deductionDao.ts";
import { DeductionType } from "../../../../models/deduction.ts";

export function useApiStudentContestRegister(app: Hono) {
  app.post("/api/student/contest/register", async (c) => {
    const { contestId } = await c.req.json();
    const claim = await getClaim(c);

    if (isNaN(contestId)) {
      return c.json({ message: "Invalid contest ID." }, 400);
    }

    try {
      const student = getStudentById(claim.id);
      if (!student) {
        return c.json({ message: "Student not found." }, 404);
      }

      if (student.balance < 30) {
        return c.json({
          message: "You need at least 30 units to register for a contest.",
        }, 400);
      }

      const contest = getContestById(contestId);
      if (!contest) {
        return c.json({ message: "Contest not found." }, 404);
      }

      const contestDate = new Date(contest.time);
      const year = contestDate.getFullYear();
      const month = contestDate.getMonth();

      if (hasStudentRegisteredForMonth(claim.id, year, month)) {
        return c.json({
          message: "You have already registered for a contest this month.",
        }, 400);
      }

      addContestant(claim.id, contestId);
      addDeduction({
        amount: 30,
        relatedId: contestId,
        studentId: claim.id,
        type: DeductionType.ContestRegistration,
      });
      updateStudentBalance(claim.id, student.balance - 30);
      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentRegisterContest,
        text:
          `Student ${student.realName} (ID: ${student.id}) registered for contest ${contest.name} (ID: ${contest.id}).`,
        relatedId: student.id,
      });

      return c.json({ message: "Registration successful!" });
    } catch (error) {
      console.error("Error registering for contest:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
