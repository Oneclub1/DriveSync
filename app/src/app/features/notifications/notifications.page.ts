import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonButtons, IonList, IonItem, IonLabel, IonIcon, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, checkmarkDoneOutline, calendarOutline,
  closeCircleOutline, alarmOutline,
} from 'ionicons/icons';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonButtons, IonList, IonItem, IonLabel, IonIcon, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Benachrichtigungen</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="markAllRead()" *ngIf="unreadCount > 0">
            <ion-icon name="checkmark-done-outline" slot="start"></ion-icon>
            Alle gelesen
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        @for (n of notifications; track n.id) {
          <ion-item [color]="n.read ? '' : 'light'" (click)="markRead(n)">
            <ion-icon [name]="iconForType(n.type)" slot="start" [color]="colorForType(n.type)"></ion-icon>
            <ion-label>
              <h2>{{ n.title }}</h2>
              <p>{{ n.message }}</p>
              <p style="color: var(--ion-color-medium); font-size: 11px;">
                {{ n.createdAt | date:'dd.MM.yyyy HH:mm' }}
              </p>
            </ion-label>
            @if (!n.read) {
              <ion-badge color="primary" slot="end">Neu</ion-badge>
            }
          </ion-item>
        }
        @if (notifications.length === 0) {
          <ion-item>
            <ion-label class="ion-text-center">
              <p>Keine Benachrichtigungen</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class NotificationsPage implements OnInit {
  notifications: AppNotification[] = [];
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {
    addIcons({
      notificationsOutline, checkmarkDoneOutline, calendarOutline,
      closeCircleOutline, alarmOutline,
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.notificationService.load().subscribe({
      next: (list) => {
        this.notifications = list;
        this.unreadCount = list.filter((n) => !n.read).length;
      },
    });
  }

  markRead(n: AppNotification) {
    if (n.read) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        n.read = true;
        this.unreadCount--;
      },
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.read = true));
        this.unreadCount = 0;
      },
    });
  }

  iconForType(type: string): string {
    if (type.startsWith('BOOKING_CREATED')) return 'calendar-outline';
    if (type.startsWith('BOOKING_CANCELLED')) return 'close-circle-outline';
    if (type === 'REMINDER') return 'alarm-outline';
    return 'notifications-outline';
  }

  colorForType(type: string): string {
    if (type.includes('CANCELLED')) return 'danger';
    if (type === 'REMINDER') return 'warning';
    if (type.includes('CONFIRMED')) return 'success';
    return 'primary';
  }
}
