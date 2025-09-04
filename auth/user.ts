import { Context, Next } from "hono";
import { getClaim } from "./claim.ts";

export async function userAuth(c: Context, next: Next) {
  const claim = await getClaim(c);
  if (!claim) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
}
