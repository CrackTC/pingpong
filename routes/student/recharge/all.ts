import { Hono } from "hono";

export function useStudentRechargeAll(app: Hono) {
  app.get("/student/recharge/all", async (c) => {
    const allRechargePage = await Deno.readTextFile(
      "./static/student/recharge/all.html",
    );
    return c.html(allRechargePage);
  });
}
