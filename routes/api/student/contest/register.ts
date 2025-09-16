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
      return c.json({ message: "无效的比赛ID。" }, 400);
    }

    try {
      const student = getStudentById(claim.id);
      if (!student) {
        return c.json({ message: "未找到学生。" }, 404);
      }

      if (student.balance < 30) {
        return c.json({
          message: "您需要至少30个单位才能报名参加比赛。",
        }, 400);
      }

      const contest = getContestById(contestId);
      if (!contest) {
        return c.json({ message: "未找到比赛。" }, 404);
      }

      const contestDate = new Date(contest.time);
      const year = contestDate.getFullYear();
      const month = contestDate.getMonth();

      if (hasStudentRegisteredForMonth(claim.id, year, month)) {
        return c.json({
          message: "您本月已报名参加比赛。",
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
          `学生 ${student.realName} (ID: ${student.id}) 报名参加比赛 ${contest.name} (ID: ${contest.id})。`,
        relatedId: student.id,
      });

      return c.json({ message: "报名成功！" });
    } catch (error) {
      console.error("报名比赛时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
