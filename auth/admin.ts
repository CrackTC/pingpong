import { Context, Next } from "hono";
import { getClaim } from "./claim.ts";

export async function adminAuth(c: Context, next: Next) {
  const claim = await getClaim(c);

  // If the user is already authenticated as admin and tries to access /admin/login,
  // redirect them to /admin/home (assuming /admin/home exists).
  if (c.req.path === "/admin/login" && claim?.type === "admin") {
    return c.redirect("/admin/home");
  }

  // If the user is trying to access /admin/login and is not authenticated as admin,
  // or if they are trying to access any other admin path, proceed.
  if (c.req.path === "/admin/login" || c.req.path === "/api/admin/login") {
    await next();
    return;
  }

  // For any other /admin/* path, check authentication.
  if (claim?.type !== "admin") {
    return c.redirect("/admin/login");
  }
  await next();
}
