import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel,
  IonBadge, IonIcon, IonAlert, IonText, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline, timeOutline } from 'ionicons/icons';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel,
    IonBadge, IonIcon, IonAlert, IonText, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Meine Buchungen</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cancelMessage) {
        <ion-note [color]="cancelFree ? 'success' : 'warning'" class="ion-padding" style="display:block; margin-bottom:12px;">
          {{ cancelMessage }}
        </ion-note>
      }

      <ion-list>
        @for (booking of bookings; track booking.id) {
          <ion-item>
            <ion-icon name="time-outline" slot="start" [color]="statusColor(booking.status)"></ion-icon>
            <ion-label>
              <h2>{{ booking.timeSlot.startTime | date:'EEEE, dd.MM.yyyy' }}</h2>
              <h3>{{ booking.timeSlot.startTime | date:'HH:mm' }} - {{ booking.timeSlot.endTime | date:'HH:mm' }}</h3>
              <p>{{ booking.timeSlot.instructor?.firstName }} {{ booking.timeSlot.instructor?.lastName }}</p>
              @if (booking.cancellationFee) {
                <p class="fee-warning">Stornierungsgebühr fällig</p>
              }
            </ion-label>
            <ion-badge [color]="statusColor(booking.status)" slot="end">
              {{ statusLabel(booking.status) }}
            </ion-badge>
            @if (canCancel(booking)) {
              <ion-button
                slot="end"
                fill="clear"
                color="danger"
                size="small"
                (click)="cancel(booking.id)">
                <ion-icon name="close-circle-outline"></ion-icon>
              </ion-button>
            }
          </ion-item>
        }
        @if (bookings.length === 0) {
          <ion-item>
            <ion-label class="ion-text-center">
              <p>Noch keine Buchungen</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
  styles: [`
    .fee-warning {
      color: var(--ion-color-danger);
      font-weight: bold;
    }
  `],
})
export class MyBookingsPage implements OnInit {
  bookings: Booking[] = [];
  cancelMessage = '';
  cancelFree = true;

  constructor(private bookingService: BookingService) {
    addIcons({ closeCircleOutline, timeOutline });
  }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => (this.bookings = bookings),
    });
  }

  canCancel(booking: Booking): boolean {
    return (
      booking.status !== 'CANCELLED' &&
      booking.status !== 'COMPLETED' &&
      new Date(booking.timeSlot.startTime) > new Date()
    );
  }

  cancel(id: string) {
    if (!confirm('Buchung wirklich stornieren? Bei zu später Stornierung wird eine Gebühr fällig.')) {
      return;
    }
    this.cancelMessage = '';

    this.bookingService.cancel(id).subscribe({
      next: (result) => {
        this.cancelMessage = result.message;
        this.cancelFree = result.isFree;
        this.loadBookings();
      },
      error: (err) => {
        this.cancelMessage = err.error?.error || 'Fehler beim Stornieren';
        this.cancelFree = false;
      },
    });
  }

  statusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      case 'COMPLETED': return 'medium';
      default: return 'medium';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Bestätigt';
      case 'PENDING': return 'Ausstehend';
      case 'CANCELLED': return 'Storniert';
      case 'COMPLETED': return 'Abgeschlossen';
      default: return status;
    }
  }
}
