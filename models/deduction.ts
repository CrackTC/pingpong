export enum DeductionType {
  Appointment,
}

export type Deduction = {
  id: number;
  studentId: number;
  type: DeductionType;
  amount: number;
  relatedId: number;
};
