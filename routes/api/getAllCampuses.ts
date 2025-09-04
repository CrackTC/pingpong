import { Hono } from "hono";
import { getAllCampuses } from "../../data/campusDao.ts";

export function useApiGetAllCampuses(app: Hono) {
  app.get("/api/getAllCampuses", (c) => {
    const campuses = getAllCampuses();
    return c.json(campuses);
  });
}
