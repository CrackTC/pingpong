import { Hono } from "hono";

import { useStudentLogin } from "./login.ts";
import { useStudentLogout } from "./logout.ts";
import { useStudentRegister } from "./register.ts";
import { useStudentHome } from "./home.ts";
import { useStudentProfile } from "./profile.ts";
import { useStudentPassword } from "./password.ts";
import { useStudentEdit } from "./edit.ts";
import { useStudentNotifications } from "./notifications.ts";
import { useStudentCoachSearch } from "./coach/search.ts";
import { useStudentSelectionAll } from "./selection/all.ts";
import { useStudentMigrationAll } from "./migration/all.ts";
import { useStudentMatchAll } from "./match/all.ts";
import { useStudentContestAll } from "./contest/all.ts";
import { useStudentRecharge } from "./recharge.ts";
import { useStudentRechargeAll } from "./recharge/all.ts";
import { useStudentDeductionAll } from "./deduction/all.ts";
import { useStudentAppointmentSearch } from "./appointment/search.ts";
import { useStudentAppointmentAll } from "./appointment/all.ts";
import { useStudentAppointmentCancelling } from "./appointment/cancelling.ts";
import { useStudentAppointmentReview } from "./appointment/review.ts";

export function useStudentRoutes(app: Hono) {
  useStudentLogin(app);
  useStudentLogout(app);
  useStudentRegister(app);
  useStudentHome(app);
  useStudentProfile(app);
  useStudentPassword(app);
  useStudentEdit(app);
  useStudentNotifications(app);
  useStudentCoachSearch(app);
  useStudentSelectionAll(app);
  useStudentMigrationAll(app);
  useStudentMatchAll(app);
  useStudentContestAll(app);
  useStudentRecharge(app);
  useStudentRechargeAll(app);
  useStudentDeductionAll(app);
  useStudentAppointmentSearch(app);
  useStudentAppointmentAll(app);
  useStudentAppointmentCancelling(app);
  useStudentAppointmentReview(app);
}
