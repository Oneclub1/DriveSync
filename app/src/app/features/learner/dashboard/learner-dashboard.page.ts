import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonList, IonItem, IonLabel, IonBadge,
  IonIcon, IonGrid, IonRow, IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, bookOutline, logOutOutline, timeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonList, IonItem, IonLabel, IonBadge,
    IonIcon, IonGrid, IonRow, IonCol,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>DriveSync</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Hallo, {{ auth.currentUser?.firstName }}!</h2>

      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card routerLink="/learner/book">
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="calendar-outline"></ion-icon>
                  Fahrstunde buchen
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Verfügbare Zeitfenster ansehen und buchen</p>
                <ion-button fill="clear" size="small">Jetzt buchen</ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card routerLink="/learner/bookings">
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="book-outline"></ion-icon>
                  Meine Buchungen
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>{{ activeBookings }} aktive Buchungen</p>
                <ion-button fill="clear" size="small">Alle anzeigen</ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      @if (nextBooking) {
        <h3>Nächste Fahrstunde</h3>
        <ion-card>
          <ion-card-content>
            <ion-item lines="none">
              <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h2>{{ nextBooking.timeSlot.startTime | date:'EEEE, dd.MM.yyyy' }}</h2>
                <h3>{{ nextBooking.timeSlot.startTime | date:'HH:mm' }} - {{ nextBooking.timeSlot.endTime | date:'HH:mm' }}</h3>
                <p>bei {{ nextBooking.timeSlot.instructor?.firstName }} {{ nextBooking.timeSlot.instructor?.lastName }}</p>
              </ion-label>
              <ion-badge [color]="nextBooking.status === 'CONFIRMED' ? 'success' : 'warning'" slot="end">
                {{ nextBooking.status === 'CONFIRMED' ? 'Bestätigt' : 'Ausstehend' }}
              </ion-badge>
            </ion-item>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>
  `,
})
export class LearnerDashboardPage implements OnInit {
  nextBooking: Booking | null = null;
  activeBookings = 0;

  constructor(
    public auth: AuthService,
    private bookingService: BookingService,
  ) {
    addIcons({ calendarOutline, bookOutline, logOutOutline, timeOutline });
  }

  ngOnInit() {
    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        const active = bookings.filter(
          (b) => b.status !== 'CANCELLED' && new Date(b.timeSlot.startTime) > new Date(),
        );
        this.activeBookings = active.length;
        this.nextBooking = active.length > 0 ? active[active.length - 1] : null;
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}
