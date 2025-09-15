import { Hono } from "hono";

export function useStudentMatchAll(app: Hono) {
  app.get("/student/match/all", async (c) => {
    const matchPage = await Deno.readTextFile(
      "./static/student/match/all.html",
    );
    return c.html(matchPage);
  });
}
