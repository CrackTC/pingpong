export enum SystemLogType {
  Campus = 1,
  StudentRegistration,
  CoachRegistration,
  Profile,
  Table,
  Timeslot,
  Appointment,
  Review,
  Payment,
  Selection,
  Migration,
}

export type SystemLog = {
  id: number;
  campusId: number
  type: SystemLogType;
  text: string;
  timestamp: number;
  relatedId: number;
};
