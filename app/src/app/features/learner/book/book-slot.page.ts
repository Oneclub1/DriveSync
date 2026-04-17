import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel,
  IonIcon, IonText, IonRefresher, IonRefresherContent, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';
import { TimeslotService } from '../../../core/services/timeslot.service';
import { BookingService } from '../../../core/services/booking.service';
import { TimeSlot } from '../../../core/models/timeslot.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-slot',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel,
    IonIcon, IonText, IonRefresher, IonRefresherContent, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Fahrstunde buchen</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (error) {
        <ion-note color="danger" class="ion-padding">{{ error }}</ion-note>
      }
      @if (success) {
        <ion-note color="success" class="ion-padding">{{ success }}</ion-note>
      }

      <h3>Verfügbare Zeitfenster</h3>

      @if (slots.length === 0) {
        <ion-text color="medium" class="ion-padding">
          <p>Keine verfügbaren Zeitfenster gefunden.</p>
        </ion-text>
      }

      <ion-list>
        @for (slot of slots; track slot.id) {
          <ion-item>
            <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>{{ slot.startTime | date:'EEEE, dd.MM.yyyy' }}</h2>
              <h3>{{ slot.startTime | date:'HH:mm' }} - {{ slot.endTime | date:'HH:mm' }}</h3>
              <p>{{ slot.instructor?.firstName }} {{ slot.instructor?.lastName }}</p>
            </ion-label>
            <ion-button slot="end" size="small" (click)="book(slot.id)">
              Buchen
            </ion-button>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class BookSlotPage implements OnInit {
  slots: TimeSlot[] = [];
  error = '';
  success = '';

  constructor(
    private slotService: TimeslotService,
    private bookingService: BookingService,
    private router: Router,
  ) {
    addIcons({ calendarOutline, timeOutline });
  }

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    this.slotService.getAvailable().subscribe({
      next: (slots) => (this.slots = slots),
      error: (err) => {
        this.error = err.error?.error || 'Fehler beim Laden';
      },
    });
  }

  book(slotId: string) {
    this.error = '';
    this.success = '';

    this.bookingService.book(slotId).subscribe({
      next: () => {
        this.success = 'Fahrstunde erfolgreich gebucht!';
        this.loadSlots();
      },
      error: (err) => {
        this.error = err.error?.error || 'Fehler beim Buchen';
      },
    });
  }

  refresh(event: any) {
    this.loadSlots();
    setTimeout(() => event.target.complete(), 500);
  }
}
