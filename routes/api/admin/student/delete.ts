import { Hono } from "hono";
import {
  deleteStudentById,
  getStudentById,
} from "../../../../data/studentDao.ts";
import {
  deleteAppointmentsByStudentId,
  getActiveAppointmentsByStudentId,
} from "../../../../data/appointmentDao.ts";
import { deleteSelectionsByStudentId } from "../../../../data/selectionDao.ts";
import { deleteDeductionsByStudentId } from "../../../../data/deductionDao.ts";
import { deleteRechargeOrdersByStudentId } from "../../../../data/rechargeOrderDao.ts";
import { getClaim } from "../../../../auth/claim.ts";
import { getAdminById } from "../../../../data/adminDao.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiAdminStudentDelete(app: Hono) {
  app.post("/api/admin/student/delete", async (c) => {
    const { studentId } = await c.req.json();

    if (isNaN(studentId)) {
      return c.json({ message: "无效的学生ID。" }, 400);
    }

    try {
      const student = getStudentById(studentId);
      if (!student) {
        return c.json({ message: "未找到学生。" }, 404);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "未找到管理员。" }, 404);
        }
        if (admin.campus !== student.campusId) {
          return c.json({
            message: "管理员无权删除此学生。",
          }, 403);
        }
      }
      const activeAppointments = getActiveAppointmentsByStudentId(studentId);
      if (activeAppointments.length > 0) {
        return c.json({
          message: "无法删除有活跃预约的学生。",
        }, 400);
      }

      // Delete related data
      deleteRechargeOrdersByStudentId(studentId);
      deleteDeductionsByStudentId(studentId);
      deleteAppointmentsByStudentId(studentId);
      deleteSelectionsByStudentId(studentId);

      // Delete student
      deleteStudentById(studentId);

      addSystemLog({
        campusId: student.campusId,
        type: SystemLogType.StudentRemove,
        text:
          `学生 ${student.realName} (ID: ${student.id}) 已被管理员 ${claim.id} 删除。`,
        relatedId: student.id,
      });

      return c.json({ message: "学生删除成功。" });
    } catch (error) {
      console.error("删除学生时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
