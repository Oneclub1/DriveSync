import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonList, IonItem, IonLabel, IonBadge, IonIcon, IonGrid,
  IonRow, IonCol, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, peopleOutline, bookOutline, timeOutline,
  trendingUpOutline, statsChartOutline, alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { StatsService } from '../../../core/services/stats.service';
import { BookingService } from '../../../core/services/booking.service';
import { InstructorStats } from '../../../core/models/stats.model';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonList, IonItem, IonLabel, IonBadge, IonIcon, IonGrid,
    IonRow, IonCol, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Hallo, {{ auth.currentUser?.firstName }}!</h2>

      @if (stats) {
        <ion-grid class="stats-grid">
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ stats.studentsCount }}</div>
                  <div class="stat-label">Schüler</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ stats.upcomingBookings }}</div>
                  <div class="stat-label">Anstehende</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ stats.bookingsThisWeek }}</div>
                  <div class="stat-label">Diese Woche</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6" size-md="3">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ stats.completedThisYear }}</div>
                  <div class="stat-label">Abgeschlossen</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        @if (stats.pendingBookings > 0) {
          <ion-card color="warning" routerLink="/instructor/bookings">
            <ion-item lines="none" color="warning">
              <ion-icon name="alert-circle-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>{{ stats.pendingBookings }} Buchung(en) zu bestätigen</h3>
              </ion-label>
            </ion-item>
          </ion-card>
        }

        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="stats-chart-outline"></ion-icon>
              Statistiken
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-label>Diesen Monat</ion-label>
              <ion-badge slot="end">{{ stats.bookingsThisMonth }}</ion-badge>
            </ion-item>
            <ion-item lines="none">
              <ion-label>Stornierungen (Monat)</ion-label>
              <ion-badge slot="end" color="danger">{{ stats.cancelledThisMonth }}</ion-badge>
            </ion-item>
            <ion-item lines="none">
              <ion-label>Stornierungsquote</ion-label>
              <ion-badge slot="end" [color]="stats.cancellationRate > 20 ? 'danger' : 'success'">
                {{ stats.cancellationRate }}%
              </ion-badge>
            </ion-item>
            <ion-item lines="none">
              <ion-label>Gesamt-Slots</ion-label>
              <ion-badge slot="end" color="medium">{{ stats.totalSlots }}</ion-badge>
            </ion-item>
          </ion-card-content>
        </ion-card>
      }

      @if (upcomingBookings.length > 0) {
        <h3>Nächste Fahrstunden</h3>
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
  styles: [`
    .stats-grid {
      padding: 0;
    }
    .stat-card {
      margin: 4px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: var(--ion-color-primary);
    }
    .stat-label {
      font-size: 12px;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `],
})
export class InstructorDashboardPage implements OnInit {
  stats: InstructorStats | null = null;
  upcomingBookings: Booking[] = [];

  constructor(
    public auth: AuthService,
    private statsService: StatsService,
    private bookingService: BookingService,
  ) {
    addIcons({
      calendarOutline, peopleOutline, bookOutline, timeOutline,
      trendingUpOutline, statsChartOutline, alertCircleOutline,
    });
  }

  ngOnInit() {
    this.statsService.getStats<InstructorStats>().subscribe({
      next: (s) => (this.stats = s),
    });

    this.bookingService.getInstructorBookings().subscribe({
      next: (bookings) => {
        this.upcomingBookings = bookings
          .filter((b) => b.status !== 'CANCELLED' && new Date(b.timeSlot.startTime) > new Date())
          .slice(0, 5);
      },
    });
  }
}
