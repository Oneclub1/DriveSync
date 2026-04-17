import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonList, IonItem, IonLabel, IonBadge, IonIcon, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle, IonInput,
  IonText, IonNote, IonSpinner, IonItemSliding, IonItemOptions,
  IonItemOption, IonAccordion, IonAccordionGroup,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, trashOutline, personAddOutline, peopleOutline,
} from 'ionicons/icons';
import { InvitationService } from '../../../core/services/invitation.service';
import { StudentService } from '../../../core/services/student.service';
import { Invitation } from '../../../core/models/invitation.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
    IonList, IonItem, IonLabel, IonBadge, IonIcon, IonCard,
    IonCardContent, IonCardHeader, IonCardTitle, IonInput,
    IonText, IonNote, IonSpinner, IonItemSliding, IonItemOptions,
    IonItemOption, IonAccordion, IonAccordionGroup,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Schüler</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="person-add-outline"></ion-icon>
            Schüler einladen
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-input
              label="E-Mail des Schülers"
              labelPlacement="floating"
              type="email"
              [(ngModel)]="inviteEmail">
            </ion-input>
          </ion-item>
          @if (error) {
            <ion-text color="danger"><p class="ion-padding-start">{{ error }}</p></ion-text>
          }
          @if (success) {
            <ion-text color="success"><p class="ion-padding-start">{{ success }}</p></ion-text>
          }
          <ion-button expand="block" class="ion-margin-top" (click)="sendInvite()" [disabled]="loading">
            @if (loading) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              <ion-icon name="mail-outline" slot="start"></ion-icon>
              Einladung senden
            }
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-accordion-group [value]="['students', 'invites']" multiple>
        <ion-accordion value="students">
          <ion-item slot="header" color="light">
            <ion-icon name="people-outline" slot="start"></ion-icon>
            <ion-label>Meine Schüler ({{ students.length }})</ion-label>
          </ion-item>
          <div slot="content">
            <ion-list>
              @for (student of students; track student.id) {
                <ion-item-sliding>
                  <ion-item>
                    <ion-label>
                      <h2>{{ student.firstName }} {{ student.lastName }}</h2>
                      <p>{{ student.email }}</p>
                      @if (student.phoneNumber) {
                        <p>{{ student.phoneNumber }}</p>
                      }
                      <p style="margin-top: 4px;">
                        <ion-badge color="primary">{{ student.stats.upcoming }} aktiv</ion-badge>
                        <ion-badge color="success" style="margin-left: 4px;">
                          {{ student.stats.completed }} abgeschl.
                        </ion-badge>
                        <ion-badge color="medium" style="margin-left: 4px;">
                          {{ student.stats.total }} gesamt
                        </ion-badge>
                      </p>
                    </ion-label>
                  </ion-item>
                  <ion-item-options>
                    <ion-item-option color="danger" (click)="removeStudent(student.id)">
                      <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                    </ion-item-option>
                  </ion-item-options>
                </ion-item-sliding>
              }
              @if (students.length === 0) {
                <ion-item>
                  <ion-label class="ion-text-center">
                    <p>Noch keine Schüler. Lade jemanden ein!</p>
                  </ion-label>
                </ion-item>
              }
            </ion-list>
          </div>
        </ion-accordion>

        <ion-accordion value="invites">
          <ion-item slot="header" color="light">
            <ion-icon name="mail-outline" slot="start"></ion-icon>
            <ion-label>Einladungen ({{ pendingInvites }})</ion-label>
          </ion-item>
          <div slot="content">
            <ion-list>
              @for (inv of invitations; track inv.id) {
                <ion-item>
                  <ion-label>
                    <h3>{{ inv.email }}</h3>
                    <p>Gesendet: {{ inv.createdAt | date:'dd.MM.yyyy' }}</p>
                  </ion-label>
                  @if (inv.isUsed) {
                    <ion-badge color="success" slot="end">Angenommen</ion-badge>
                  } @else if (isExpired(inv)) {
                    <ion-badge color="medium" slot="end">Abgelaufen</ion-badge>
                  } @else {
                    <ion-button slot="end" fill="clear" color="danger" size="small" (click)="revokeInvite(inv.id)">
                      <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                  }
                </ion-item>
              }
              @if (invitations.length === 0) {
                <ion-item>
                  <ion-label class="ion-text-center">
                    <p>Noch keine Einladungen</p>
                  </ion-label>
                </ion-item>
              }
            </ion-list>
          </div>
        </ion-accordion>
      </ion-accordion-group>
    </ion-content>
  `,
})
export class StudentListPage implements OnInit {
  inviteEmail = '';
  invitations: Invitation[] = [];
  students: Student[] = [];
  error = '';
  success = '';
  loading = false;

  constructor(
    private invitationService: InvitationService,
    private studentService: StudentService,
  ) {
    addIcons({ mailOutline, trashOutline, personAddOutline, peopleOutline });
  }

  ngOnInit() {
    this.loadAll();
  }

  get pendingInvites() {
    return this.invitations.filter((i) => !i.isUsed && !this.isExpired(i)).length;
  }

  loadAll() {
    this.studentService.getStudents().subscribe({
      next: (s) => (this.students = s),
    });
    this.invitationService.getMyInvitations().subscribe({
      next: (i) => (this.invitations = i),
    });
  }

  sendInvite() {
    this.error = '';
    this.success = '';
    this.loading = true;
    this.invitationService.create(this.inviteEmail).subscribe({
      next: () => {
        this.loading = false;
        this.success = `Einladung an ${this.inviteEmail} gesendet!`;
        this.inviteEmail = '';
        this.loadAll();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Fehler beim Senden';
      },
    });
  }

  revokeInvite(id: string) {
    this.invitationService.revoke(id).subscribe({ next: () => this.loadAll() });
  }

  removeStudent(id: string) {
    if (!confirm('Schüler wirklich entfernen?')) return;
    this.studentService.removeStudent(id).subscribe({ next: () => this.loadAll() });
  }

  isExpired(inv: Invitation): boolean {
    return new Date(inv.expiresAt) < new Date();
  }
}
