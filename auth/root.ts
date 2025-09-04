import { Context, Next } from "hono";
import { getClaim } from "./claim.ts";

export async function rootAuth(c: Context, next: Next) {
  const claim = await getClaim(c);

  if (c.req.path === "/root/login" && claim?.type === "root") {
    return c.redirect("/root/home");
  }

  if (c.req.path === "/root/login" || c.req.path === "/api/root/login") {
    await next();
    return;
  }

  if (claim?.type !== "root") {
    return c.redirect("/root/login");
  }
  await next();
}
