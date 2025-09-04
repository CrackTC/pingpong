import { Sex } from "./sex.ts";

export type Student = {
  id: number;
  username: string;
  realName: string;
  sex: Sex | null;
  birthYear: number | null;
  campusId: number;
  phone: string;
  email: string | null;
  balance: number;
};
