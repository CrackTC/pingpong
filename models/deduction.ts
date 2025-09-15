export enum DeductionType {
  Appointment,
  ContestRegistration,
}

export type Deduction = {
  id: number;
  studentId: number;
  type: DeductionType;
  amount: number;
  relatedId: number;
};
