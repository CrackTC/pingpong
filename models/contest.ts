export enum ContestType {
  Junior = 1,
  Mid,
  Senior,
}

export type Contest = {
  id: number;
  name: string;
  type: ContestType;
  time: number;
};
