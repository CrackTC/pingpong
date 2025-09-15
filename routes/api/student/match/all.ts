import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getMatchesByStudentId } from "../../../../data/matchDao.ts";
import { getLastContests } from "../../../../data/contestDao.ts";
import { getContestantByContestIdAndSeq } from "../../../../data/contestantDao.ts";
import { getStudentById } from "../../../../data/studentDao.ts";

export function useApiStudentMatchAll(app: Hono) {
  app.get("/api/student/match/all", async (c) => {
    const claim = await getClaim(c);
    const studentId = claim.id;

    try {
      const latestContest = getLastContests(1)[0];

      if (!latestContest) {
        return c.json({ matches: [] });
      }

      const matches = getMatchesByStudentId(studentId);

      const enrichedMatches = matches.map(match => {
        let opponentName = "N/A";
        if (match.opponentSeq !== null) {
          const opponentContestant = getContestantByContestIdAndSeq(match.contestId, match.opponentSeq);
          if (opponentContestant) {
            const opponentStudent = getStudentById(opponentContestant.studentId);
            if (opponentStudent) {
              opponentName = opponentStudent.realName;
            }
          }
        }
        return {
          ...match,
          opponentName,
          contestName: latestContest.name, // Assuming matches are for the latest contest
        };
      });

      return c.json(enrichedMatches);
    } catch (error) {
      console.error("Error fetching student matches:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
