export enum NotificationTarget {
  Student = 1,
  Coach,
  Admin,
}

export type Notification = {
  id: number;
  campusId: number;
  target: NotificationTarget;
  targetId: number;
  message: string;
  link: string;
  timestamp: number;
  isRead: boolean;
};
