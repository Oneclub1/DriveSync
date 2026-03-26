import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel,
  IonBadge, IonIcon, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonInput, IonText, IonNote, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, trashOutline, personAddOutline } from 'ionicons/icons';
import { InvitationService } from '../../../core/services/invitation.service';
import { Invitation } from '../../../core/models/invitation.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel,
    IonBadge, IonIcon, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonInput, IonText, IonNote, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/instructor/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Schüler & Einladungen</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Einladung senden -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="person-add-outline"></ion-icon>
            Schüler einladen
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-input
              label="E-Mail des Schülers"
              labelPlacement="floating"
              type="email"
              [(ngModel)]="inviteEmail"
              required>
            </ion-input>
          </ion-item>

          @if (error) {
            <ion-text color="danger">
              <p class="ion-padding-start">{{ error }}</p>
            </ion-text>
          }

          @if (success) {
            <ion-text color="success">
              <p class="ion-padding-start">{{ success }}</p>
            </ion-text>
          }

          <ion-button
            expand="block"
            class="ion-margin-top"
            (click)="sendInvite()"
            [disabled]="loading">
            @if (loading) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              <ion-icon name="mail-outline" slot="start"></ion-icon>
              Einladung senden
            }
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Einladungsliste -->
      <h3 class="ion-padding-start">Gesendete Einladungen</h3>
      <ion-list>
        @for (inv of invitations; track inv.id) {
          <ion-item>
            <ion-icon name="mail-outline" slot="start"></ion-icon>
            <ion-label>
              <h3>{{ inv.email }}</h3>
              <p>Gesendet: {{ inv.createdAt | date:'dd.MM.yyyy' }}</p>
              <p>Gültig bis: {{ inv.expiresAt | date:'dd.MM.yyyy' }}</p>
            </ion-label>
            @if (inv.isUsed) {
              <ion-badge color="success" slot="end">Angenommen</ion-badge>
            } @else if (isExpired(inv)) {
              <ion-badge color="medium" slot="end">Abgelaufen</ion-badge>
            } @else {
              <ion-button
                slot="end"
                fill="clear"
                color="danger"
                size="small"
                (click)="revokeInvite(inv.id)">
                <ion-icon name="trash-outline"></ion-icon>
              </ion-button>
            }
          </ion-item>
        }
        @if (invitations.length === 0) {
          <ion-item>
            <ion-label class="ion-text-center">
              <p>Noch keine Einladungen gesendet</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class StudentListPage implements OnInit {
  inviteEmail = '';
  invitations: Invitation[] = [];
  error = '';
  success = '';
  loading = false;

  constructor(private invitationService: InvitationService) {
    addIcons({ mailOutline, trashOutline, personAddOutline });
  }

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.invitationService.getMyInvitations().subscribe({
      next: (invitations) => (this.invitations = invitations),
    });
  }

  sendInvite() {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.invitationService.create(this.inviteEmail).subscribe({
      next: () => {
        this.loading = false;
        this.success = `Einladung an ${this.inviteEmail} gesendet!`;
        this.inviteEmail = '';
        this.loadInvitations();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Fehler beim Senden';
      },
    });
  }

  revokeInvite(id: string) {
    this.invitationService.revoke(id).subscribe({
      next: () => this.loadInvitations(),
    });
  }

  isExpired(inv: Invitation): boolean {
    return new Date(inv.expiresAt) < new Date();
  }
}
