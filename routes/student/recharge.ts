import { Hono } from "hono";

export function useStudentRecharge(app: Hono) {
  app.get("/student/recharge", async (c) => {
    const rechargePage = await Deno.readTextFile(
      "./static/student/recharge.html",
    );
    return c.html(rechargePage);
  });
}
