import { Context, Next } from "hono";
import { getClaim } from "./claim.ts";

export async function studentAuth(c: Context, next: Next) {
  const claim = await getClaim(c);

  // If the user is already authenticated as student and tries to access /student/login,
  // redirect them to /student/home (assuming /student/home exists).
  if (c.req.path === "/student/login" && claim?.type === "student") {
    return c.redirect("/student/home");
  }

  // If the user is trying to access /student/login and is not authenticated as student,
  // or if they are trying to access /api/student/login, proceed.
  if (
    c.req.path === "/student/login" || c.req.path === "/api/student/login" ||
    c.req.path === "/student/register" || c.req.path === "/api/student/register"
  ) {
    await next();
    return;
  }

  // For any other /student/* path, check authentication.
  if (claim?.type !== "student") {
    return c.redirect("/student/login");
  }
  await next();
}
