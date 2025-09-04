import { Hono } from "hono";
import { getAllAdmins } from "../../../../data/adminDao.ts";

export function useApiGetAllAdmins(app: Hono) {
  app.get("/api/root/admin/all", (c) => {
    return c.json(getAllAdmins());
  });
}
