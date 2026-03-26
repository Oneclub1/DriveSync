export interface TimeSlot {
  id: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  slotType: 'LESSON' | 'BLOCKED' | 'BREAK';
  createdAt: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  booking?: {
    id: string;
    status: string;
    learner?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface CreateSlotRequest {
  startTime: string;
  endTime: string;
  slotType?: string;
  repeatWeeks?: number;
}
