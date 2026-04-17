import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentIntent {
  mode: 'demo' | 'stripe';
  clientSecret: string | null;
  amount: number;
  message?: string;
}

export interface PaymentStatus {
  status: 'NONE' | 'PENDING' | 'PAID' | 'FAILED';
  amount?: number;
  ref?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  createIntent(bookingId: string): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${environment.apiBase}/payments/intent`, {
      bookingId,
    });
  }

  getStatus(bookingId: string): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(
      `${environment.apiBase}/payments/status/${bookingId}`,
    );
  }
}
