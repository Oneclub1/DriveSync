import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel,
  IonBadge, IonIcon, IonSegment, IonSegmentButton,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-instructor-bookings',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel,
    IonBadge, IonIcon, IonSegment, IonSegmentButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Buchungen</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-segment [(ngModel)]="filter" (ionChange)="filterBookings()">
        <ion-segment-button value="all">Alle</ion-segment-button>
        <ion-segment-button value="pending">Ausstehend</ion-segment-button>
        <ion-segment-button value="confirmed">Bestätigt</ion-segment-button>
      </ion-segment>

      <ion-list class="ion-margin-top">
        @for (booking of filteredBookings; track booking.id) {
          <ion-item>
            <ion-label>
              <h2>{{ booking.learner?.firstName }} {{ booking.learner?.lastName }}</h2>
              <h3>{{ booking.timeSlot.startTime | date:'dd.MM.yyyy HH:mm' }} - {{ booking.timeSlot.endTime | date:'HH:mm' }}</h3>
              <p>{{ booking.learner?.email }}</p>
            </ion-label>
            @if (booking.status === 'PENDING') {
              <ion-button slot="end" color="success" size="small" (click)="confirm(booking.id)">
                <ion-icon name="checkmark-outline" slot="start"></ion-icon>
                Bestätigen
              </ion-button>
            } @else {
              <ion-badge
                [color]="statusColor(booking.status)"
                slot="end">
                {{ statusLabel(booking.status) }}
              </ion-badge>
            }
          </ion-item>
        }
        @if (filteredBookings.length === 0) {
          <ion-item>
            <ion-label class="ion-text-center">
              <p>Keine Buchungen</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class InstructorBookingsPage implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  filter = 'all';

  constructor(private bookingService: BookingService) {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getInstructorBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.filterBookings();
      },
    });
  }

  filterBookings() {
    if (this.filter === 'all') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(
        (b) => b.status === this.filter.toUpperCase(),
      );
    }
  }

  confirm(id: string) {
    this.bookingService.confirm(id).subscribe({
      next: () => this.loadBookings(),
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
