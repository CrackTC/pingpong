import { Hono } from "hono";
import { useSession } from "npm:@hono/session";
import { Claim, getClaim, setClaim } from "./auth/claim.ts";
import { useRootLogin } from "./routes/root/login.ts";
import { useRootLogout } from "./routes/root/logout.ts";
import { useRootHome } from "./routes/root/home.ts";
import { useApiGetAllCampuses } from "./routes/api/getAllCampuses.ts";
import { rootAuth } from "./auth/root.ts";
import { userAuth } from "./auth/user.ts";
import { useRootCampuses } from "./routes/root/campuses.ts";
import { useRootAdmins } from "./routes/root/admins.ts";
import { useApiGetAllAdmins } from "./routes/api/root/getAllAdmins.ts";
import { useApiAddAdmin } from "./routes/api/root/addAdmin.ts";
import { useRootAddCampus } from "./routes/root/addCampus.ts";
import { useApiAddCampus } from "./routes/api/root/addCampus.ts";
import { useApiRootLogin } from "./routes/api/root/login.ts";
import { useAdminLogin } from "./routes/admin/login.ts";
import { useApiAdminLogin } from "./routes/api/admin/login.ts";
import { useStudentLogin } from "./routes/student/login.ts";
import { useApiStudentLogin } from "./routes/api/student/login.ts";
import { useCoachLogin } from "./routes/coach/login.ts";
import { useApiCoachLogin } from "./routes/api/coach/login.ts";
import { useStudentRegister } from "./routes/student/register.ts";
import { useApiStudentRegister } from "./routes/api/student/register.ts";
import { adminAuth } from "./auth/admin.ts";
import { studentAuth } from "./auth/student.ts";
import { coachAuth } from "./auth/coach.ts";

const app = new Hono();

app.use(useSession({ secret: "SkoUqVOXTewLQiZSrdgK/DFKYQHDxmTMN1m5/0M9YLw=" }));

app.use("/root/*", rootAuth);
app.use("/api/root/*", rootAuth);
app.use("/admin/*", adminAuth);
app.use("/api/admin/*", adminAuth);
app.use("/student/*", studentAuth);
app.use("/api/student/*", studentAuth);
app.use("/coach/*", coachAuth);
app.use("/api/coach/*", coachAuth);
app.use("/api/getAllCampuses", userAuth);
app.use("/campuses", userAuth);

useRootLogin(app);
useRootLogout(app);
useRootHome(app);
useApiGetAllCampuses(app);
useRootCampuses(app);
useRootAdmins(app);
useApiGetAllAdmins(app);
useApiAddAdmin(app);
useRootAddCampus(app);
useApiAddCampus(app);
useApiRootLogin(app);
useAdminLogin(app);
useApiAdminLogin(app);
useStudentLogin(app);
useApiStudentLogin(app);
useCoachLogin(app);
useApiCoachLogin(app);
useStudentRegister(app);
useApiStudentRegister(app);

app.get("/", async (c) => {
  const claim = await getClaim(c);
  return c.json(claim);
});

app.get("/setClaim", async (c) => {
  const claim: Claim = {
    type: "admin",
    id: 123456,
  };

  await setClaim(c, claim);
  return c.json({ message: "Claim set" });
});

Deno.serve(app.fetch);
