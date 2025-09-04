import { Sex } from "./sex.ts";

export type Student = {
  id: number;
  username: string;
  realName: string;
  sex?: Sex;
  birthYear?: number;
  campusId: number;
  phone: string;
  email?: string;
  balance: number;
}
