import { Context, Next } from "hono";
import { getClaim } from "./claim.ts";

export async function coachAuth(c: Context, next: Next) {
  const claim = await getClaim(c);

  // If the user is already authenticated as coach and tries to access /coach/login,
  // redirect them to /coach/home (assuming /coach/home exists).
  if (c.req.path === "/coach/login" && claim?.type === "coach") {
    return c.redirect("/coach/home");
  }

  // If the user is trying to access /coach/login and is not authenticated as coach,
  // or if they are trying to access /api/coach/login, proceed.
  if (c.req.path === "/coach/login" || c.req.path === "/api/coach/login") {
    await next();
    return;
  }

  // For any other /coach/* path, check authentication.
  if (claim?.type !== "coach") {
    return c.redirect("/coach/login");
  }
  await next();
}
