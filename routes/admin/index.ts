import { Hono } from "hono";

import { useAdminLogin } from "./login.ts";
import { useAdminLogout } from "./logout.ts";
import { useAdminHome } from "./home.ts";
import { useAdminNotifications } from "./notifications.ts";
import { useAdminMigrations } from "./migrations.ts";
import { useAdminSystemLogs } from "./system-logs.ts";
import { useAdminAppointments } from "./appointments.ts";
import { useAdminCoaches } from "./coach.ts";
import { useAdminCoachEdit } from "./coach/edit.ts";
import { useAdminCoachAdd } from "./coach/add.ts";
import { useAdminCoachSearch } from "./coach/search.ts";
import { useAdminStudentEdit } from "./student/edit.ts";
import { useAdminStudentAdd } from "./student/add.ts";
import { useAdminStudentSearch } from "./student/search.ts";
import { useAdminTableAdd } from "./table/add.ts";
import { useAdminTableAll } from "./table/all.ts";

export function useAdminRoutes(app: Hono) {
  useAdminLogin(app);
  useAdminLogout(app);
  useAdminHome(app);
  useAdminNotifications(app);
  useAdminMigrations(app);
  useAdminSystemLogs(app);
  useAdminAppointments(app);
  useAdminCoaches(app);
  useAdminCoachEdit(app);
  useAdminCoachAdd(app);
  useAdminCoachSearch(app);
  useAdminStudentEdit(app);
  useAdminStudentAdd(app);
  useAdminStudentSearch(app);
  useAdminTableAdd(app);
  useAdminTableAll(app);
}

