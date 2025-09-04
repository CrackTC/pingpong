export enum CampusType {
  Center = 1,
  Branch,
}

export type Campus = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  type: CampusType;
};
