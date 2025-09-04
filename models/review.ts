export enum ReviewType {
  Student = 1,
  Coach = 2,
}

export enum ReviewStatus {
  Pending = 1,
  Completed = 2,
}

export type Review = {
  id: number;
  campusId: number;
  appointmentId: number;
  type: ReviewType;
  text: string | null;
  rating: number | null;
  status: ReviewStatus;
};
