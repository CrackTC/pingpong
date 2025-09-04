export enum SelectionStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Outdated = 4,
}

export type Selection = {
  id: number;
  studentId: number;
  coachId: number;
  campusId: number;
  status: SelectionStatus;
};
