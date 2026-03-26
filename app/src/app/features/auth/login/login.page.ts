import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonInput, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonText, IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonItem, IonInput, IonLabel, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonText, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>DriveSync</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Anmelden</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input
                label="E-Mail"
                labelPlacement="floating"
                type="email"
                [(ngModel)]="email"
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

            @if (error) {
              <ion-text color="danger">
                <p class="ion-padding-start">{{ error }}</p>
              </ion-text>
            }

            <ion-button
              expand="block"
              class="ion-margin-top"
              (click)="onLogin()"
              [disabled]="loading">
              @if (loading) {
                <ion-spinner name="crescent"></ion-spinner>
              } @else {
                Anmelden
              }
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              routerLink="/register">
              Als Fahrlehrer registrieren
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-container {
      max-width: 450px;
      margin: 40px auto;
    }
  `],
})
export class LoginPage {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.error = '';
    this.loading = true;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user.role === 'INSTRUCTOR') {
          this.router.navigate(['/instructor']);
        } else {
          this.router.navigate(['/learner']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Anmeldung fehlgeschlagen';
      },
    });
  }
}
