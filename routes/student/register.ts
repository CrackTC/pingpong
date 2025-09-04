import { Hono } from "hono";

export function useStudentRegister(app: Hono) {
  app.get("/student/register", async (c) => {
    const registerPage = await Deno.readTextFile(
      "./static/student/register.html",
    );
    return c.html(registerPage);
  });
}
