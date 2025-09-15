import { db } from "./db.ts";
import { Review } from "../models/review.ts";

export function addReview(review: Omit<Review, "id">): number {
  const stmt = db.prepare(
    "INSERT INTO reviews (campusId, appointmentId, type, text, rating, status) VALUES (?, ?, ?, ?, ?, ?)",
  );
  stmt.run(
    review.campusId,
    review.appointmentId,
    review.type,
    review.text,
    review.rating,
    review.status,
  );
  return db.prepare("SELECT last_insert_rowid() as id").get<{ id: number }>()
    ?.id ?? 0;
}

export function getReviewsByAppointmentId(appointmentId: number): Review[] {
  const stmt = db.prepare("SELECT * FROM reviews WHERE appointmentId = ?");
  return stmt.all(appointmentId) as Review[];
}
