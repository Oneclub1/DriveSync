import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CancelResponse } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  book(timeSlotId: string, notes?: string): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiBase}/bookings`, { timeSlotId, notes });
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiBase}/bookings/mine`);
  }

  getInstructorBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${environment.apiBase}/bookings/instructor`);
  }

  cancel(id: string): Observable<CancelResponse> {
    return this.http.delete<CancelResponse>(`${environment.apiBase}/bookings/${id}`);
  }

  confirm(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${environment.apiBase}/bookings/${id}/confirm`, {});
  }
}
