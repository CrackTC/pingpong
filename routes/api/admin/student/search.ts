import { Hono } from "hono";
import { searchStudentsByPhone } from "../../../../data/studentDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";

export function useApiAdminStudentSearch(app: Hono) {
  app.post("/api/admin/student/search", async (c) => {
    const { phone } = await c.req.json();
    const claim = await getClaim(c);

    if (!phone) {
      return c.json({ message: "搜索查询是必填项。" }, 400);
    }

    try {
      let students;
      if (claim.type === "root") {
        students = searchStudentsByPhone(phone);
      } else if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        students = searchStudentsByPhone(phone, admin.campus);
      } else {
        return c.json({ message: "未授权" }, 401);
      }
      return c.json(students);
    } catch (error) {
      console.error("搜索学生时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
