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
        { message: "预约ID和评分是必填项。" },
        400,
      );
    }

    try {
      const appointment = getAppointmentById(appointmentId);
      if (!appointment) {
        return c.json({ message: "未找到预约。" }, 404);
      }

      if (appointment.studentId !== claim.id) {
        return c.json({ message: "未授权。" }, 401);
      }

      if (appointment.status !== AppointmentStatus.Completed) {
        return c.json({
          message: "您只能评价已完成的预约。",
        }, 400);
      }

      const existingReviews = getReviewsByAppointmentId(appointmentId);
      if (existingReviews.some((r) => r.type === ReviewType.StudentToCoach)) {
        return c.json({
          message: "您已评价过此预约。",
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
          `学生 ID ${claim.id} 评价了教练 ID ${appointment.coachId} 的预约 ID ${appointmentId}，评分为 ${rating}。`,
        relatedId: id,
      });

      return c.json({ message: "评价提交成功。" });
    } catch (error) {
      console.error("提交评价时出错：", error);
      return c.json({ message: "发生意外错误。" }, 500);
    }
  });
}
