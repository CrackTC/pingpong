import { Hono } from "hono";

import { useApiRootLogin } from "./login.ts";
import { useApiAddCampus } from "./campus/add.ts";
import { useApiAddAdmin } from "./admin/add.ts";
import { useApiGetAllAdmins } from "./admin/all.ts";

export function useApiRootRoutes(app: Hono) {
  useApiRootLogin(app);
  useApiAddCampus(app);
  useApiAddAdmin(app);
  useApiGetAllAdmins(app);
}

