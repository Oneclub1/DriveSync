import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonList, IonItem, IonLabel, IonBadge,
  IonIcon, IonGrid, IonRow, IonCol, IonMenuButton,
  IonMenu, IonSplitPane, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, peopleOutline, bookOutline, logOutOutline, timeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { TimeslotService } from '../../../core/services/timeslot.service';
import { BookingService } from '../../../core/services/booking.service';
import { TimeSlot } from '../../../core/models/timeslot.model';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonList, IonItem, IonLabel, IonBadge,
    IonIcon, IonGrid, IonRow, IonCol, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Dashboard</ion-title>
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
            <ion-card routerLink="/instructor/slots">
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="calendar-outline"></ion-icon>
                  Zeitfenster
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>{{ todaySlots.length }} Slots heute</p>
                <ion-button fill="clear" size="small">Verwalten</ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card routerLink="/instructor/bookings">
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="book-outline"></ion-icon>
                  Buchungen
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>{{ pendingBookings.length }} ausstehend</p>
                <ion-button fill="clear" size="small">Alle anzeigen</ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6">
            <ion-card routerLink="/instructor/students">
              <ion-card-header>
                <ion-card-title>
                  <ion-icon name="people-outline"></ion-icon>
                  Schüler
                </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Schüler einladen & verwalten</p>
                <ion-button fill="clear" size="small">Öffnen</ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      @if (upcomingBookings.length > 0) {
        <h3>Nächste Buchungen</h3>
        <ion-list>
          @for (booking of upcomingBookings; track booking.id) {
            <ion-item>
              <ion-icon name="time-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>{{ booking.learner?.firstName }} {{ booking.learner?.lastName }}</h3>
                <p>{{ booking.timeSlot.startTime | date:'dd.MM.yyyy HH:mm' }} - {{ booking.timeSlot.endTime | date:'HH:mm' }}</p>
              </ion-label>
              <ion-badge [color]="booking.status === 'CONFIRMED' ? 'success' : 'warning'" slot="end">
                {{ booking.status === 'CONFIRMED' ? 'Bestätigt' : 'Ausstehend' }}
              </ion-badge>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
})
export class InstructorDashboardPage implements OnInit {
  todaySlots: TimeSlot[] = [];
  pendingBookings: Booking[] = [];
  upcomingBookings: Booking[] = [];

  constructor(
    public auth: AuthService,
    private slotService: TimeslotService,
    private bookingService: BookingService,
  ) {
    addIcons({ calendarOutline, peopleOutline, bookOutline, logOutOutline, timeOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.slotService.getMySlots(today.toISOString(), tomorrow.toISOString()).subscribe({
      next: (slots) => (this.todaySlots = slots),
    });

    this.bookingService.getInstructorBookings().subscribe({
      next: (bookings) => {
        this.pendingBookings = bookings.filter((b) => b.status === 'PENDING');
        this.upcomingBookings = bookings
          .filter((b) => b.status !== 'CANCELLED' && new Date(b.timeSlot.startTime) > new Date())
          .slice(0, 5);
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}
