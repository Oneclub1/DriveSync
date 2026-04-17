import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface InstructorSettings {
  cancellationDeadlineHours: number;
  maxBookingsPerWeek: number;
  reminderHoursBefore: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  update(data: Partial<User> & { emailNotifications?: boolean }): Observable<User> {
    return this.http.patch<User>(`${environment.apiBase}/profile`, data);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiBase}/profile/password`, {
      oldPassword,
      newPassword,
    });
  }

  updateSettings(settings: Partial<InstructorSettings>): Observable<InstructorSettings> {
    return this.http.patch<InstructorSettings>(
      `${environment.apiBase}/profile/settings`,
      settings,
    );
  }
}
