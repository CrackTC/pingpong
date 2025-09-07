import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getTimeslotById } from "../../../../data/timeslotDao.ts";
import { getCoachById } from "../../../../data/coachDao.ts";
import { getAvailableTables } from "../../../../data/tableDao.ts";
import { addAppointment } from "../../../../data/appointmentDao.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { addNotification } from "../../../../data/notificationDao.ts";
import { NotificationTarget } from "../../../../models/notification.ts";
import { getStudentById } from "../../../../data/studentDao.ts";

export function useApiStudentAppointmentBook(app: Hono) {
  app.post("/api/student/appointment/book", async (c) => {
    const { timeslotId, tableId } = await c.req.json();
    const claim = await getClaim(c);

    if (isNaN(timeslotId)) {
      return c.json({ message: "Invalid timeslot ID." }, 400);
    }

    try {
      const timeslot = getTimeslotById(timeslotId);
      if (!timeslot) {
        return c.json({ message: "Timeslot not found." }, 404);
      }

      const coach = getCoachById(timeslot.coachId);
      if (!coach) {
        return c.json({ message: "Coach not found." }, 404);
      }

      const studentId = claim.id;
      const student = getStudentById(studentId);
      if (!student) {
        return c.json({ message: "Student not found" }, 404);
      }

      let selectedTableId = tableId;

      if (!selectedTableId) {
        // "Let the system select"
        const availableTables = getAvailableTables(coach.campusId, timeslot);
        if (availableTables.length === 0) {
          return c.json(
            { message: "No available tables for this timeslot." },
            400,
          );
        }
        selectedTableId = availableTables[0].id;
      }

      addAppointment({
        campusId: coach.campusId,
        studentId,
        coachId: timeslot.coachId,
        tableId: selectedTableId,
        timeslotId,
        status: AppointmentStatus.Pending,
      });

      addNotification(
        coach.campusId,
        NotificationTarget.Coach,
        coach.id,
        `New appointment request from ${student.realName}`,
        `/coach/appointment/pending`, // Link for coach to view pending appointments
        Date.now(),
      );

      return c.json({ message: "Appointment booked successfully." });
    } catch (error) {
      console.error("Error booking appointment:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
