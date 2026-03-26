import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimeSlot, CreateSlotRequest } from '../models/timeslot.model';

@Injectable({ providedIn: 'root' })
export class TimeslotService {
  constructor(private http: HttpClient) {}

  getAvailable(from?: string, to?: string): Observable<TimeSlot[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<TimeSlot[]>(`${environment.apiBase}/slots/available`, { params });
  }

  getMySlots(from?: string, to?: string): Observable<TimeSlot[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<TimeSlot[]>(`${environment.apiBase}/slots/my`, { params });
  }

  createSlot(data: CreateSlotRequest): Observable<TimeSlot | TimeSlot[]> {
    return this.http.post<TimeSlot | TimeSlot[]>(`${environment.apiBase}/slots`, data);
  }

  deleteSlot(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/slots/${id}`);
  }
}
