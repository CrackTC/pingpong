import { Hono } from "hono";

export function useStudentContestAll(app: Hono) {
  app.get("/student/contest/all", async (c) => {
    const contestPage = await Deno.readTextFile(
      "./static/student/contest/all.html",
    );
    return c.html(contestPage);
  });
}
