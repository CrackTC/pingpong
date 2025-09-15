export enum SystemLogType {
  RootLogin,
  AdminLogin,
  AdminCancelAppointment,
  StudentLogin,
  CoachLogin,
  CampusAdd,
  AdminAdd,
  StudentAdd,
  StudentRegister,
  StudentRemove,
  StudentUpdate,
  StudentChangePassword,
  StudentSelectCoach,
  StudentRecharge,
  PaymentComplete,
  PaymentCancel,
  StudentBookAppointment,
  StudentCancelAppointment,
  StudentApproveCancel,
  StudentReviewCoach,
  StudentRequestMigration,
  StudentRegisterContest,
  CoachAdd,
  CoachRegister,
  CoachApprove,
  CoachRemove,
  CoachUpdate,
  CoachChangeAvatar,
  CoachChangePassword,
  CoachApproveSelection,
  CoachRejectSelection,
  CoachAddTimeslot,
  CoachApproveAppointment,
  CoachRejectAppointment,
  CoachCancelAppointment,
  CoachApproveCancel,
  CoachReviewStudent,
  TableAdd,
  MigrationApprove,
  MigrationComplete,
  MigrationReject,
}

export type SystemLog = {
  id: number;
  campusId: number;
  type: SystemLogType;
  text: string;
  timestamp: number;
  relatedId: number;
};
