import { Hono } from "hono";

import { useCoachLogin } from "./login.ts";
import { useCoachLogout } from "./logout.ts";
import { useCoachRegister } from "./register.ts";
import { useCoachHome } from "./home.ts";
import { useCoachProfile } from "./profile.ts";
import { useCoachPassword } from "./password.ts";
import { useCoachEdit } from "./edit.ts";
import { useCoachNotifications } from "./notifications.ts";
import { useCoachStudents } from "./students.ts";
import { useCoachAvatar } from "./avatar.ts";
import { useCoachTimeslotAll } from "./timeslot/all.ts";
import { useCoachTimeslotAdd } from "./timeslot/add.ts";
import { useCoachAppointmentPending } from "./appointment/pending.ts";
import { useCoachAppointmentAll } from "./appointment/all.ts";
import { useCoachAppointmentCancelling } from "./appointment/cancelling.ts";
import { useCoachAppointmentReview } from "./appointment/review.ts";
import { useCoachSelectionPending } from "./selection/pending.ts";
import { useCoachMigrationPending } from "./migration/pending.ts";

export function useCoachRoutes(app: Hono) {
  useCoachLogin(app);
  useCoachLogout(app);
  useCoachRegister(app);
  useCoachHome(app);
  useCoachProfile(app);
  useCoachPassword(app);
  useCoachEdit(app);
  useCoachNotifications(app);
  useCoachStudents(app);
  useCoachAvatar(app);
  useCoachTimeslotAll(app);
  useCoachTimeslotAdd(app);
  useCoachAppointmentPending(app);
  useCoachAppointmentAll(app);
  useCoachAppointmentCancelling(app);
  useCoachAppointmentReview(app);
  useCoachSelectionPending(app);
  useCoachMigrationPending(app);
}
