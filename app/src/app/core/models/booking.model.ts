export interface Booking {
  id: string;
  learnerId: string;
  timeSlotId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  bookedAt: string;
  cancelledAt?: string;
  cancellationFee: boolean;
  notes?: string;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    instructor?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  learner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CancelResponse {
  booking: Booking;
  isFree: boolean;
  message: string;
}
