import { Hono } from "hono";

import { useRootRoutes } from "./root/index.ts";
import { useAdminRoutes } from "./admin/index.ts";
import { useCoachRoutes } from "./coach/index.ts";
import { useStudentRoutes } from "./student/index.ts";
import { useApiRoutes } from "./api/index.ts";
import { usePayment } from "./payment.ts";

export function useRoutes(app: Hono) {
  // UI routes grouped by role
  useRootRoutes(app);
  useAdminRoutes(app);
  useCoachRoutes(app);
  useStudentRoutes(app);

  // Misc UI routes
  usePayment(app);

  // API routes
  useApiRoutes(app);
}

