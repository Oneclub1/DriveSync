import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, calendarOutline, bookOutline, peopleOutline,
  personOutline, notificationsOutline,
} from 'ionicons/icons';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-instructor-tabs',
  standalone: true,
  imports: [
    CommonModule,
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge,
  ],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Start</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="slots">
          <ion-icon name="calendar-outline"></ion-icon>
          <ion-label>Slots</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="bookings">
          <ion-icon name="book-outline"></ion-icon>
          <ion-label>Buchungen</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="students">
          <ion-icon name="people-outline"></ion-icon>
          <ion-label>Schüler</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="notifications">
          <ion-icon name="notifications-outline"></ion-icon>
          @if (unread > 0) {
            <ion-badge color="danger">{{ unread }}</ion-badge>
          }
          <ion-label>Inbox</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class InstructorTabsPage implements OnInit {
  unread = 0;

  constructor(private notificationService: NotificationService) {
    addIcons({
      homeOutline, calendarOutline, bookOutline, peopleOutline,
      personOutline, notificationsOutline,
    });
  }

  ngOnInit() {
    this.notificationService.unreadCount$.subscribe((c) => (this.unread = c));
    this.notificationService.load().subscribe();
    setInterval(() => this.notificationService.load().subscribe(), 30000);
  }
}
