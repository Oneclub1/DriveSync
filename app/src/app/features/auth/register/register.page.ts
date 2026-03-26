import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonInput, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonText, IonSpinner, IonNote,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { InvitationService } from '../../../core/services/invitation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonItem, IonInput, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonText, IonSpinner, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>DriveSync - Registrierung</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ inviteToken ? 'Als Fahrschüler registrieren' : 'Als Fahrlehrer registrieren' }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            @if (inviteToken && instructorName) {
              <ion-note class="ion-padding-bottom" style="display:block; margin-bottom:16px;">
                Einladung von <strong>{{ instructorName }}</strong>
              </ion-note>
            }

            @if (inviteToken && inviteEmail) {
              <ion-item>
                <ion-input
                  label="E-Mail"
                  labelPlacement="floating"
                  type="email"
                  [value]="inviteEmail"
                  disabled>
                </ion-input>
              </ion-item>
            }

            @if (!inviteToken) {
              <ion-item>
                <ion-input
                  label="E-Mail"
                  labelPlacement="floating"
                  type="email"
                  [(ngModel)]="email"
                  required>
                </ion-input>
              </ion-item>
            }

            <ion-item>
              <ion-input
                label="Vorname"
                labelPlacement="floating"
                [(ngModel)]="firstName"
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                label="Nachname"
                labelPlacement="floating"
                [(ngModel)]="lastName"
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                label="Passwort"
                labelPlacement="floating"
                type="password"
                [(ngModel)]="password"
                required>
              </ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                label="Telefon (optional)"
                labelPlacement="floating"
                type="tel"
                [(ngModel)]="phoneNumber">
              </ion-input>
            </ion-item>

            @if (error) {
              <ion-text color="danger">
                <p class="ion-padding-start">{{ error }}</p>
              </ion-text>
            }

            <ion-button
              expand="block"
              class="ion-margin-top"
              (click)="onRegister()"
              [disabled]="loading">
              @if (loading) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                Registrieren
              }
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              routerLink="/login">
              Bereits registriert? Anmelden
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .register-container {
      max-width: 450px;
      margin: 40px auto;
    }
  `],
})
export class RegisterPage implements OnInit {
  email = '';
  firstName = '';
  lastName = '';
  password = '';
  phoneNumber = '';
  error = '';
  loading = false;
  inviteToken = '';
  inviteEmail = '';
  instructorName = '';

  constructor(
    private auth: AuthService,
    private invitationService: InvitationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['invite']) {
        this.inviteToken = params['invite'];
        this.validateInvite();
      }
    });
  }

  private validateInvite() {
    this.invitationService.validateToken(this.inviteToken).subscribe({
      next: (result) => {
        if (!result.valid) {
          this.error = 'Einladung ungültig oder abgelaufen';
          this.inviteToken = '';
        } else {
          this.inviteEmail = result.email || '';
          this.instructorName = result.instructorName || '';
        }
      },
      error: () => {
        this.error = 'Einladung konnte nicht überprüft werden';
        this.inviteToken = '';
      },
    });
  }

  onRegister() {
    this.error = '';
    this.loading = true;

    if (this.inviteToken) {
      this.auth
        .registerWithInvite({
          token: this.inviteToken,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          phoneNumber: this.phoneNumber || undefined,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/learner']);
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.error || 'Registrierung fehlgeschlagen';
          },
        });
    } else {
      this.auth
        .registerInstructor({
          email: this.email,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          phoneNumber: this.phoneNumber || undefined,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/instructor']);
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.error || 'Registrierung fehlgeschlagen';
          },
        });
    }
  }
}
