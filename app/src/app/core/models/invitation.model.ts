export interface Invitation {
  id: string;
  instructorId: string;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  isUsed: boolean;
}

export interface InviteValidation {
  valid: boolean;
  email: string | null;
  instructorName: string | null;
}
