import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InstructorStats, LearnerStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getStats<T = InstructorStats | LearnerStats>(): Observable<T> {
    return this.http.get<T>(`${environment.apiBase}/stats`);
  }
}
