import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonBackButton, IonList, IonItem, IonLabel,
  IonBadge, IonIcon, IonFab, IonFabButton, IonModal,
  IonInput, IonSelect, IonSelectOption, IonDatetime,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonItemSliding, IonItemOptions, IonItemOption, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { TimeslotService } from '../../../core/services/timeslot.service';
import { TimeSlot } from '../../../core/models/timeslot.model';

@Component({
  selector: 'app-manage-slots',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel,
    IonBadge, IonIcon, IonFab, IonFabButton, IonModal,
    IonInput, IonSelect, IonSelectOption, IonDatetime,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItemSliding, IonItemOptions, IonItemOption, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/instructor/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Zeitfenster</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Neuen Slot erstellen -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Neues Zeitfenster</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-input
              label="Start"
              labelPlacement="floating"
              type="datetime-local"
              [(ngModel)]="newSlot.startTime">
            </ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Ende"
              labelPlacement="floating"
              type="datetime-local"
              [(ngModel)]="newSlot.endTime">
            </ion-input>
          </ion-item>
          <ion-item>
            <ion-select
              label="Typ"
              labelPlacement="floating"
              [(ngModel)]="newSlot.slotType">
              <ion-select-option value="LESSON">Fahrstunde</ion-select-option>
              <ion-select-option value="BLOCKED">Gesperrt</ion-select-option>
              <ion-select-option value="BREAK">Pause</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input
              label="Wochen wiederholen"
              labelPlacement="floating"
              type="number"
              [(ngModel)]="newSlot.repeatWeeks"
              min="1"
              max="12">
            </ion-input>
          </ion-item>
          <ion-button expand="block" class="ion-margin-top" (click)="createSlot()">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Erstellen
          </ion-button>
        </ion-card-content>
      </ion-card>

      @if (error) {
        <ion-note color="danger" class="ion-padding">{{ error }}</ion-note>
      }

      <!-- Slot-Liste -->
      <h3 class="ion-padding-start">Meine Zeitfenster</h3>
      <ion-list>
        @for (slot of slots; track slot.id) {
          <ion-item-sliding>
            <ion-item>
              <ion-label>
                <h3>{{ slot.startTime | date:'dd.MM.yyyy HH:mm' }} - {{ slot.endTime | date:'HH:mm' }}</h3>
                <p>{{ slotTypeLabel(slot.slotType) }}</p>
              </ion-label>
              @if (slot.booking && slot.booking.status !== 'CANCELLED') {
                <ion-badge color="warning" slot="end">Gebucht</ion-badge>
              } @else {
                <ion-badge color="success" slot="end">Frei</ion-badge>
              }
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" (click)="deleteSlot(slot.id)">
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        }
        @if (slots.length === 0) {
          <ion-item>
            <ion-label class="ion-text-center">
              <p>Noch keine Zeitfenster erstellt</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class ManageSlotsPage implements OnInit {
  slots: TimeSlot[] = [];
  error = '';
  newSlot = {
    startTime: '',
    endTime: '',
    slotType: 'LESSON',
    repeatWeeks: 1,
  };

  constructor(private slotService: TimeslotService) {
    addIcons({ addOutline, trashOutline });
  }

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    this.slotService.getMySlots().subscribe({
      next: (slots) => (this.slots = slots),
    });
  }

  createSlot() {
    this.error = '';
    if (!this.newSlot.startTime || !this.newSlot.endTime) {
      this.error = 'Bitte Start- und Endzeit angeben';
      return;
    }

    this.slotService
      .createSlot({
        startTime: new Date(this.newSlot.startTime).toISOString(),
        endTime: new Date(this.newSlot.endTime).toISOString(),
        slotType: this.newSlot.slotType,
        repeatWeeks: this.newSlot.repeatWeeks,
      })
      .subscribe({
        next: () => {
          this.newSlot = { startTime: '', endTime: '', slotType: 'LESSON', repeatWeeks: 1 };
          this.loadSlots();
        },
        error: (err) => {
          this.error = err.error?.error || 'Fehler beim Erstellen';
        },
      });
  }

  deleteSlot(id: string) {
    this.slotService.deleteSlot(id).subscribe({
      next: () => this.loadSlots(),
      error: (err) => {
        this.error = err.error?.error || 'Fehler beim Löschen';
      },
    });
  }

  slotTypeLabel(type: string): string {
    switch (type) {
      case 'LESSON': return 'Fahrstunde';
      case 'BLOCKED': return 'Gesperrt';
      case 'BREAK': return 'Pause';
      default: return type;
    }
  }
}
