export enum AppointmentStatus {
  Pending = 1,
  Approved,
  Rejected,
  StudentCancelling,
  CoachCancelling,
  StudentCancelled,
  CoachCancelled,
  Completed,
}

export type Appointment = {
  id: number;
  campusId: number;
  studentId: number;
  coachId: number;
  tableId: number;
  timeslotId: number;
  status: AppointmentStatus;
};
