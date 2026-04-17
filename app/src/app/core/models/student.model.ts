export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  assignedAt: string;
  stats: {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  };
}
