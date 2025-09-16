import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { useSession } from "npm:@hono/session";

import { getClaim } from "./auth/claim.ts";
import { rootAuth } from "./auth/root.ts";
import { userAuth } from "./auth/user.ts";
import { adminAuth } from "./auth/admin.ts";
import { studentAuth } from "./auth/student.ts";
import { coachAuth } from "./auth/coach.ts";

import { useRoutes } from "./routes/index.ts";

const app = new Hono();

app.use("/static/avatars/*", serveStatic({ root: "./" }));

// @ts-ignore It works but types are wrong
app.use(useSession({ secret: "SkoUqVOXTewLQiZSrdgK/DFKYQHDxmTMN1m5/0M9YLw=" }));

// Auth middlewares
app.use("/root/*", rootAuth);
app.use("/api/root/*", rootAuth);
app.use("/admin/*", adminAuth);
app.use("/api/admin/*", adminAuth);
app.use("/student/*", studentAuth);
app.use("/api/student/*", studentAuth);
app.use("/coach/*", coachAuth);
app.use("/api/coach/*", coachAuth);
app.use("/api/campus/*", userAuth);

// Mount all routes via aggregators
useRoutes(app);

Deno.serve(app.fetch);
