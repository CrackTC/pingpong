import { Hono } from "hono";
import { deleteStudentById } from "../../../../data/studentDao.ts";
import { getActiveAppointmentsByStudentId, deleteAppointmentsByStudentId } from "../../../../data/appointmentDao.ts";
import { deleteSelectionsByStudentId } from "../../../../data/selectionDao.ts";
import { deleteDeductionsByStudentId } from "../../../../data/deductionDao.ts";
import { deleteRechargeOrdersByStudentId } from "../../../../data/rechargeOrderDao.ts";

export function useApiAdminStudentDelete(app: Hono) {
  app.post("/api/admin/student/delete", async (c) => {
    const { studentId } = await c.req.json();

    if (isNaN(studentId)) {
      return c.json({ message: "Invalid student ID." }, 400);
    }

    try {
      const activeAppointments = getActiveAppointmentsByStudentId(studentId);
      if (activeAppointments.length > 0) {
        return c.json({ message: "Cannot delete student with active appointments." }, 400);
      }

      // Delete related data
      deleteRechargeOrdersByStudentId(studentId);
      deleteDeductionsByStudentId(studentId);
      deleteAppointmentsByStudentId(studentId);
      deleteSelectionsByStudentId(studentId);

      // Delete student
      deleteStudentById(studentId);

      return c.json({ message: "Student deleted successfully." });
    } catch (error) {
      console.error("Error deleting student:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
