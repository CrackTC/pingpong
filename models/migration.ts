export enum MigrationStatus {
  Pending = 1,
  OriginCoachApproved = 2,
  DestCoachApproved = 4,
  CampusAdminApproved = 8,
  Completed = 15,
  Rejected = -1,
}

export type Migration = {
  id: number;
  campusId: number;
  selectionId: number;
  destCoachId: number;
  status: MigrationStatus;
};
