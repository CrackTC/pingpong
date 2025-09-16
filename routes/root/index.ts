import { Hono } from "hono";

import { useRootLogin } from "./login.ts";
import { useRootLogout } from "./logout.ts";
import { useRootHome } from "./home.ts";
import { useRootCampuses } from "./campus.ts";
import { useRootAdmins } from "./admin.ts";

export function useRootRoutes(app: Hono) {
  useRootLogin(app);
  useRootLogout(app);
  useRootHome(app);
  useRootCampuses(app);
  useRootAdmins(app);
}
