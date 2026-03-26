import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invitation, InviteValidation } from '../models/invitation.model';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  constructor(private http: HttpClient) {}

  create(email: string): Observable<Invitation> {
    return this.http.post<Invitation>(`${environment.apiBase}/invitations`, { email });
  }

  getMyInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${environment.apiBase}/invitations`);
  }

  validateToken(token: string): Observable<InviteValidation> {
    return this.http.get<InviteValidation>(`${environment.apiBase}/invitations/validate/${token}`);
  }

  revoke(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/invitations/${id}`);
  }
}
