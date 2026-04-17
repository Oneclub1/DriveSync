import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonItem, IonLabel, IonBadge, IonIcon,
  IonGrid, IonRow, IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, bookOutline, timeOutline, statsChartOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { StatsService } from '../../../core/services/stats.service';
import { Booking } from '../../../core/models/booking.model';
import { LearnerStats } from '../../../core/models/stats.model';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [
    CommonModule, DatePipe, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonItem, IonLabel, IonBadge, IonIcon,
    IonGrid, IonRow, IonCol,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>DriveSync</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Hallo, {{ auth.currentUser?.firstName }}!</h2>

      @if (stats) {
        <ion-grid class="stats-grid">
          <ion-row>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ stats.upcomingBookings }}</div>
                  <div class="stat-label">Anstehend</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ stats.completedTotal }}</div>
                  <div class="stat-label">Abgeschlossen</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        @if (stats.cancellationFees > 0) {
          <ion-card color="warning">
            <ion-item lines="none" color="warning">
              <ion-icon name="alert-circle-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>{{ stats.cancellationFees }}× Stornierungsgebühr offen</h3>
              </ion-label>
            </ion-item>
          </ion-card>
        }
      }

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
  styles: [`
    .stats-grid { padding: 0; }
    .stat-card { margin: 4px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: var(--ion-color-primary); }
    .stat-label { font-size: 12px; color: var(--ion-color-medium); text-transform: uppercase; }
  `],
})
export class LearnerDashboardPage implements OnInit {
  nextBooking: Booking | null = null;
  stats: LearnerStats | null = null;

  constructor(
    public auth: AuthService,
    private bookingService: BookingService,
    private statsService: StatsService,
  ) {
    addIcons({
      calendarOutline, bookOutline, timeOutline, statsChartOutline, alertCircleOutline,
    });
  }

  ngOnInit() {
    this.statsService.getStats<LearnerStats>().subscribe({
      next: (s) => (this.stats = s),
    });

    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        const active = bookings
          .filter((b) => b.status !== 'CANCELLED' && new Date(b.timeSlot.startTime) > new Date())
          .sort(
            (a, b) =>
              new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.startTime).getTime(),
          );
        this.nextBooking = active.length > 0 ? active[0] : null;
      },
    });
  }
}
