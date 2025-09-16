import { Hono } from "hono";
import { getClaim } from "../../../auth/claim.ts";
import { getAppointmentById } from "../../../data/appointmentDao.ts";
import { getReviewsByAppointmentId } from "../../../data/reviewDao.ts";
import { ReviewType } from "../../../models/review.ts";

export function useApiAppointmentReviews(app: Hono) {
  app.get("/api/appointment/:appointmentId/reviews", async (c) => {
    const appointmentId = parseInt(c.req.param("appointmentId"));
    const claim = await getClaim(c);

    if (isNaN(appointmentId)) {
      return c.json({ message: "无效的预约ID。" }, 400);
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "未找到预约。" }, 404);
      }

      // Verify user is part of the appointment
      if (claim.type !== "student" && claim.type !== "coach") {
        return c.json({ message: "未授权的角色。" }, 403);
      }
      if (claim.type === "student" && claim.id !== appointment.studentId) {
        return c.json({ message: "未授权。" }, 403);
      }
      if (claim.type === "coach" && claim.id !== appointment.coachId) {
        return c.json({ message: "未授权。" }, 403);
      }

      const reviews = getReviewsByAppointmentId(appointmentId);
      let myReview = null;
      let theirReview = null;

      const myReviewType = claim.type === "student"
        ? ReviewType.StudentToCoach
        : ReviewType.CoachToStudent;

      for (const review of reviews) {
        if (review.type === myReviewType) {
          myReview = review;
        } else {
          theirReview = review;
        }
      }

      // Only show their review if you have submitted yours
      const canShowTheirReview = !!myReview;

      return c.json({
        myReview,
        theirReview: canShowTheirReview ? theirReview : null,
      });
    } catch (error) {
      console.error("获取评价时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
