import { Hono } from "hono";

export function useStudentDeductionAll(app: Hono) {
  app.get("/student/deduction/all", async (c) => {
    const allDeductionPage = await Deno.readTextFile(
      "./static/student/deduction/all.html",
    );
    return c.html(allDeductionPage);
  });
}
