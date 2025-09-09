export enum RechargeOrderStatus {
  Created,
  Paid,
  Cancelled,
}

export type RechargeOrder = {
  id: number;
  orderNumber: string;
  studentId: number;
  amount: number;
  status: RechargeOrderStatus;
};
