import { Hono } from "hono";

export function useStudentLogin(app: Hono) {
  app.get("/student/login", async (c) => {
    const loginPage = await Deno.readTextFile(
      "./static/student/login.html",
    );
    return c.html(loginPage);
  });
}
