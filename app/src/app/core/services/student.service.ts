import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${environment.apiBase}/students`);
  }

  removeStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/students/${id}`);
  }
}
