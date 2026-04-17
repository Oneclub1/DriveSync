import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${environment.apiBase}/notifications`).pipe(
      tap((list) => {
        this.unreadCountSubject.next(list.filter((n) => !n.read).length);
      }),
    );
  }

  markAsRead(id: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${environment.apiBase}/notifications/${id}/read`,
      {},
    );
  }

  markAllAsRead(): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(`${environment.apiBase}/notifications/read-all`, {})
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  getVapidPublicKey(): Observable<{ key: string }> {
    return this.http.get<{ key: string }>(
      `${environment.apiBase}/notifications/vapid-public-key`,
    );
  }

  savePushSubscription(sub: PushSubscriptionJSON): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${environment.apiBase}/profile/push-subscription`,
      sub,
    );
  }
}
