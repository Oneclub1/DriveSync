import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterInstructorRequest,
  RegisterWithInviteRequest,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBase}/auth/login`, data).pipe(
      tap((res) => this.handleAuth(res)),
    );
  }

  registerInstructor(data: RegisterInstructorRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/auth/register-instructor`, data)
      .pipe(tap((res) => this.handleAuth(res)));
  }

  registerWithInvite(data: RegisterWithInviteRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/auth/register-with-invite`, data)
      .pipe(tap((res) => this.handleAuth(res)));
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.apiBase}/auth/me`);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }
}
