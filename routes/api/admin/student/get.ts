import { Hono } from "hono";
import { getStudentById } from "../../../../data/studentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminStudentGet(app: Hono) {
  app.get("/api/admin/student/:id", async (c) => {
    const id = c.req.param("id");
    const claim = await getClaim(c);

    if (!id) {
      return c.json(
        { success: false, message: "学生ID是必填项。" },
        400,
      );
    }

    const student = getStudentById(parseInt(id));
    if (!student) {
      return c.json({ success: false, message: "未找到学生。" }, 404);
    }

    if (claim.type === "admin") {
      const admin = getAdminById(claim.id);
      if (admin?.campus !== student.campusId) {
        return c.json({ success: false, message: "未授权" }, 401);
      }
    }

    return c.json(student);
  });
}
