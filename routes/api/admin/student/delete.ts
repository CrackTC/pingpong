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
      return c.json({ message: "Invalid student ID." }, 400);
    }

    try {
      const student = getStudentById(studentId);
      if (!student) {
        return c.json({ message: "Student not found." }, 404);
      }

      const claim = await getClaim(c);
      if (claim.type === "admin") {
        const admin = getAdminById(claim.id);
        if (!admin) {
          return c.json({ message: "Admin not found." }, 404);
        }
        if (admin.campus !== student.campusId) {
          return c.json({
            message: "Admin does not have permission to delete this student.",
          }, 403);
        }
      }
      const activeAppointments = getActiveAppointmentsByStudentId(studentId);
      if (activeAppointments.length > 0) {
        return c.json({
          message: "Cannot delete student with active appointments.",
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
          `Student ${student.realName} (ID: ${student.id}) was deleted by admin ${claim.id}.`,
        relatedId: student.id,
      });

      return c.json({ message: "Student deleted successfully." });
    } catch (error) {
      console.error("Error deleting student:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
