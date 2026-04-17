export interface InstructorStats {
  studentsCount: number;
  totalSlots: number;
  upcomingBookings: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  cancelledThisMonth: number;
  completedThisYear: number;
  pendingBookings: number;
  cancellationRate: number;
  dayDistribution: number[];
}

export interface LearnerStats {
  upcomingBookings: number;
  bookingsThisWeek: number;
  completedTotal: number;
  cancelledTotal: number;
  cancellationFees: number;
}
