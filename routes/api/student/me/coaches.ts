import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getApprovedCoachesForStudent } from "../../../../data/selectionDao.ts"; // Use the new DAO function

export function useApiStudentMeCoaches(app: Hono) {
  app.get("/api/student/me/coaches", async (c) => {
    const claim = await getClaim(c);

    if (!claim || claim.type !== "student") {
      return c.json({ message: "未授权" }, 401);
    }

    try {
      const coaches = getApprovedCoachesForStudent(claim.id); // Use the new DAO function
      return c.json(coaches);
    } catch (error) {
      console.error("获取学生教练时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
