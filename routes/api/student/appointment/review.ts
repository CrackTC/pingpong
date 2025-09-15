import { Hono } from "hono";
import { getClaim } from "../../../../auth/claim.ts";
import { getAppointmentById } from "../../../../data/appointmentDao.ts";
import {
  addReview,
  getReviewsByAppointmentId,
} from "../../../../data/reviewDao.ts";
import { ReviewStatus, ReviewType } from "../../../../models/review.ts";
import { AppointmentStatus } from "../../../../models/appointment.ts";
import { addSystemLog } from "../../../../data/systemLogDao.ts";
import { SystemLogType } from "../../../../models/systemLog.ts";

export function useApiStudentAppointmentReview(app: Hono) {
  app.post("/api/student/appointment/review", async (c) => {
    const { appointmentId, rating, comment } = await c.req.json();
    const claim = await getClaim(c);

    if (!appointmentId || !rating) {
      return c.json(
        { message: "Appointment ID and rating are required." },
        400,
      );
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "Appointment not found." }, 404);
      }

      if (appointment.studentId !== claim.id) {
        return c.json({ message: "Unauthorized." }, 401);
      }

      if (appointment.status !== AppointmentStatus.Completed) {
        return c.json({
          message: "You can only review completed appointments.",
        }, 400);
      }

      const existingReviews = getReviewsByAppointmentId(appointmentId);
      if (existingReviews.some((r) => r.type === ReviewType.StudentToCoach)) {
        return c.json({
          message: "You have already reviewed this appointment.",
        }, 400);
      }

      const id = addReview({
        campusId: appointment.campusId,
        appointmentId,
        type: ReviewType.StudentToCoach,
        text: comment,
        rating,
        status: ReviewStatus.Completed,
      });

      addSystemLog({
        campusId: appointment.campusId,
        type: SystemLogType.StudentReviewCoach,
        text:
          `Student ID ${claim.id} reviewed Coach ID ${appointment.coachId} for Appointment ID ${appointmentId} with rating ${rating}.`,
        relatedId: id,
      });

      return c.json({ message: "Review submitted successfully." });
    } catch (error) {
      console.error("Error submitting review:", error);
      return c.json({ message: "An unexpected error occurred." }, 500);
    }
  });
}
