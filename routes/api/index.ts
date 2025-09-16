import { Hono } from "hono";

import { useApiStudentRoutes } from "./student/index.ts";
import { useApiCoachRoutes } from "./coach/index.ts";
import { useApiAdminRoutes } from "./admin/index.ts";
import { useApiRootRoutes } from "./root/index.ts";

import { useApiGetAllCampuses } from "./campus/all.ts";
import { useApiAppointmentReviews } from "./appointment/reviews.ts";
import { useApiPayment } from "./payment.ts";
import { useApiDebugArrangeMatches } from "./debug/arrangeMatches.ts";
import { useApiDebugClaim } from "./debug/claim.ts";

export function useApiRoutes(app: Hono) {
  useApiRootRoutes(app);
  useApiAdminRoutes(app);
  useApiCoachRoutes(app);
  useApiStudentRoutes(app);

  useApiGetAllCampuses(app);
  useApiAppointmentReviews(app);
  useApiPayment(app);
  useApiDebugArrangeMatches(app);
  useApiDebugClaim(app);
}
