import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonItem, IonInput, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonText, IonSpinner, IonToggle, IonRange,
  IonNote, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, downloadOutline, notificationsOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonItem, IonInput, IonLabel, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonText, IonSpinner, IonToggle, IonRange,
    IonNote, IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Profil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Persönliche Daten</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-input label="E-Mail" labelPlacement="floating" [value]="email" disabled></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Vorname" labelPlacement="floating" [(ngModel)]="firstName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Nachname" labelPlacement="floating" [(ngModel)]="lastName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Telefon" labelPlacement="floating" [(ngModel)]="phoneNumber"></ion-input>
          </ion-item>
          <ion-item lines="none">
            <ion-toggle [(ngModel)]="emailNotifications">E-Mail-Benachrichtigungen</ion-toggle>
          </ion-item>
          @if (saveMessage) {
            <ion-text [color]="saveError ? 'danger' : 'success'">
              <p class="ion-padding-start">{{ saveMessage }}</p>
            </ion-text>
          }
          <ion-button expand="block" class="ion-margin-top" (click)="save()" [disabled]="saving">
            @if (saving) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Speichern
            }
          </ion-button>
        </ion-card-content>
      </ion-card>

      @if (isInstructor) {
        <ion-card>
          <ion-card-header>
            <ion-card-title>Buchungs-Einstellungen</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input
                type="number"
                label="Stornierungsfrist (Stunden)"
                labelPlacement="floating"
                [(ngModel)]="cancellationDeadlineHours"
                min="0" max="168">
              </ion-input>
            </ion-item>
            <ion-note class="ion-padding-start">
              Schüler müssen mindestens X Stunden vor der Fahrstunde stornieren um keine Gebühr zu zahlen.
            </ion-note>
            <ion-item>
              <ion-input
                type="number"
                label="Max. Buchungen pro Woche"
                labelPlacement="floating"
                [(ngModel)]="maxBookingsPerWeek"
                min="1" max="20">
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                type="number"
                label="Erinnerung X Stunden vorher"
                labelPlacement="floating"
                [(ngModel)]="reminderHoursBefore"
                min="1" max="168">
              </ion-input>
            </ion-item>
            @if (settingsMessage) {
              <ion-text [color]="settingsError ? 'danger' : 'success'">
                <p class="ion-padding-start">{{ settingsMessage }}</p>
              </ion-text>
            }
            <ion-button expand="block" class="ion-margin-top" (click)="saveSettings()" [disabled]="savingSettings">
              @if (savingSettings) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                Einstellungen speichern
              }
            </ion-button>
          </ion-card-content>
        </ion-card>
      }

      <ion-card>
        <ion-card-header>
          <ion-card-title>Passwort ändern</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-input
              type="password"
              label="Aktuelles Passwort"
              labelPlacement="floating"
              [(ngModel)]="oldPassword">
            </ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="password"
              label="Neues Passwort"
              labelPlacement="floating"
              [(ngModel)]="newPassword">
            </ion-input>
          </ion-item>
          @if (passwordMessage) {
            <ion-text [color]="passwordError ? 'danger' : 'success'">
              <p class="ion-padding-start">{{ passwordMessage }}</p>
            </ion-text>
          }
          <ion-button expand="block" class="ion-margin-top" (click)="changePassword()">
            Passwort ändern
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="download-outline"></ion-icon>
            Kalender abonnieren
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Verbinde DriveSync mit deinem Apple/Google/Outlook-Kalender:</p>
          <ion-item>
            <ion-input readonly [value]="icsUrl"></ion-input>
          </ion-item>
          <ion-button expand="block" fill="outline" (click)="copyIcsUrl()">
            URL kopieren
          </ion-button>
          <ion-note class="ion-padding-start" style="display:block; margin-top:8px;">
            Füge diese URL als "Kalender-Abo" in deinem Kalender ein.
          </ion-note>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="notifications-outline"></ion-icon>
            Push-Benachrichtigungen
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          @if (pushSupported) {
            @if (pushSubscribed) {
              <ion-text color="success">
                <p>Push-Benachrichtigungen sind aktiviert</p>
              </ion-text>
            } @else {
              <ion-button expand="block" (click)="enablePush()">
                Push-Benachrichtigungen aktivieren
              </ion-button>
            }
          } @else {
            <ion-note>Push wird in diesem Browser nicht unterstützt.</ion-note>
          }
          @if (pushMessage) {
            <ion-text color="warning">
              <p class="ion-padding-start">{{ pushMessage }}</p>
            </ion-text>
          }
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
})
export class ProfilePage implements OnInit {
  email = '';
  firstName = '';
  lastName = '';
  phoneNumber = '';
  emailNotifications = true;
  isInstructor = false;

  cancellationDeadlineHours = 24;
  maxBookingsPerWeek = 3;
  reminderHoursBefore = 24;

  oldPassword = '';
  newPassword = '';

  saving = false;
  savingSettings = false;
  saveMessage = '';
  saveError = false;
  settingsMessage = '';
  settingsError = false;
  passwordMessage = '';
  passwordError = false;

  pushSupported = false;
  pushSubscribed = false;
  pushMessage = '';

  icsUrl = '';

  constructor(
    public auth: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    addIcons({ logOutOutline, downloadOutline, notificationsOutline });
  }

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.email = user.email;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.phoneNumber = user.phoneNumber || '';
      this.isInstructor = user.role === 'INSTRUCTOR';
    }

    this.icsUrl = `${environment.apiBase}/calendar/ics?token=${this.auth.token}`;

    this.pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    if (this.pushSupported && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          this.pushSubscribed = !!sub;
        });
      });
    }
  }

  save() {
    this.saving = true;
    this.saveMessage = '';
    this.profileService
      .update({
        firstName: this.firstName,
        lastName: this.lastName,
        phoneNumber: this.phoneNumber,
        emailNotifications: this.emailNotifications,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.saveError = false;
          this.saveMessage = 'Gespeichert';
        },
        error: (err) => {
          this.saving = false;
          this.saveError = true;
          this.saveMessage = err.error?.error || 'Fehler beim Speichern';
        },
      });
  }

  saveSettings() {
    this.savingSettings = true;
    this.settingsMessage = '';
    this.profileService
      .updateSettings({
        cancellationDeadlineHours: this.cancellationDeadlineHours,
        maxBookingsPerWeek: this.maxBookingsPerWeek,
        reminderHoursBefore: this.reminderHoursBefore,
      })
      .subscribe({
        next: () => {
          this.savingSettings = false;
          this.settingsError = false;
          this.settingsMessage = 'Einstellungen gespeichert';
        },
        error: (err) => {
          this.savingSettings = false;
          this.settingsError = true;
          this.settingsMessage = err.error?.error || 'Fehler';
        },
      });
  }

  changePassword() {
    this.passwordMessage = '';
    this.profileService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordError = false;
        this.passwordMessage = 'Passwort geändert';
        this.oldPassword = '';
        this.newPassword = '';
      },
      error: (err) => {
        this.passwordError = true;
        this.passwordMessage = err.error?.error || 'Fehler';
      },
    });
  }

  copyIcsUrl() {
    navigator.clipboard.writeText(this.icsUrl);
    this.saveMessage = 'URL in die Zwischenablage kopiert';
    this.saveError = false;
  }

  async enablePush() {
    this.pushMessage = '';
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        this.pushMessage = 'Berechtigung verweigert';
        return;
      }

      const { key } = await new Promise<{ key: string }>((resolve, reject) =>
        this.notificationService.getVapidPublicKey().subscribe({ next: resolve, error: reject }),
      );

      if (!key) {
        this.pushMessage = 'Push noch nicht konfiguriert (VAPID-Keys fehlen)';
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(key),
      });

      this.notificationService.savePushSubscription(sub.toJSON()).subscribe({
        next: () => (this.pushSubscribed = true),
        error: (e) => (this.pushMessage = e.error?.error || 'Fehler beim Speichern'),
      });
    } catch (e: any) {
      this.pushMessage = e.message || 'Push fehlgeschlagen';
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
    return output;
  }

  logout() {
    this.auth.logout();
  }
}
