import { Context } from "hono";

export type Claim = {
  type: "root" | "admin" | "student" | "coach";
  id: number;
};

export async function getClaim(c: Context) {
  const data = await c.var.session.get();
  return data as Claim;
}

export async function setClaim(c: Context, claim: Claim) {
  await c.var.session.update(claim);
}

export async function clearClaim(c: Context) {
  await c.var.session.delete();
}
