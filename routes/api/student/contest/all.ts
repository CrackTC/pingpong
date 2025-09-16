import { Hono } from "hono";
import { addContest, getLastContests } from "../../../../data/contestDao.ts";
import { ContestType } from "../../../../models/contest.ts";
import { arrangeMatches, scheduleTask } from "../../../../utils.ts";

// Helper function to get the timestamp of the 4th Sunday of a given month/year
function getFourthSundayOfMonth(year: number, month: number): number {
  const day = 1;
  let sundayCount = 0;
  const date = new Date(year, month, day);

  while (sundayCount < 4) {
    if (date.getDay() === 0) { // Sunday is 0
      sundayCount++;
    }
    if (sundayCount < 4) {
      date.setDate(date.getDate() + 1);
    }
  }
  // Set time to 10:00 AM for consistency
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function useApiStudentContestAll(app: Hono) {
  app.get("/api/student/contest/all", (c) => {
    try {
      const lastContest = getLastContests(1)[0];
      const now = Date.now();

      // Only add new contests if the last contest is in the past
      // or if there are no contests yet.
      if (!lastContest || lastContest.time < now) {
        let yearToAdd = new Date().getFullYear();
        let monthToAdd = new Date().getMonth(); // Current month (0-indexed)

        // Calculate the 4th Sunday of the current month
        const fourthSundayOfCurrentMonth = getFourthSundayOfMonth(
          yearToAdd,
          monthToAdd,
        );

        // If the 4th Sunday of the current month has already passed,
        // then we need to add contests for the next month.
        if (fourthSundayOfCurrentMonth < now) {
          const nextMonthDate = new Date();
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          yearToAdd = nextMonthDate.getFullYear();
          monthToAdd = nextMonthDate.getMonth();
        }

        const contestTime = getFourthSundayOfMonth(yearToAdd, monthToAdd);

        const monthName = new Date(yearToAdd, monthToAdd).toLocaleString(
          "zh-CN",
          { month: "long" },
        );

        // Add Beginner, Intermediate, Senior contests for the determined month
        addContest(
          `${yearToAdd}年${monthName}月度赛 - 初级组`,
          ContestType.Junior,
          contestTime,
        );
        addContest(
          `${yearToAdd}年${monthName}月度赛 - 中级组`,
          ContestType.Mid,
          contestTime,
        );
        addContest(
          `${yearToAdd}年${monthName}月度赛 - 高级组`,
          ContestType.Senior,
          contestTime,
        );

        scheduleTask(arrangeMatches, new Date(contestTime));
      }

      // Always return a reasonable number of recent contests
      const allContests = getLastContests(100); // Get a reasonable number of recent contests

      return c.json(allContests);
    } catch (error) {
      console.error("获取/添加比赛时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
