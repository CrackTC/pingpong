import { Sex } from "./sex.ts";

export enum CoachType {
  Pending = 1,
  Junior,
  Intermediate,
  Senior,
}

export type Coach = {
  id: number;
  username: string;
  realName: string;
  sex: Sex | null;
  birthYear: number | null;
  campusId: number;
  phone: string;
  email: string | null;
  idCardNumber: string | null;
  avatarPath: string;
  comment: string;
  type: CoachType;
};
