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
  sex?: Sex;
  birthYear?: number;
  campusId: number;
  phone: string;
  email?: string;
  avatarPath: string;
  comment: string;
  type: CoachType;
};
