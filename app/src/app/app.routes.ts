import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'instructor',
    canActivate: [authGuard, roleGuard('INSTRUCTOR')],
    loadComponent: () =>
      import('./features/instructor/instructor-tabs.page').then((m) => m.InstructorTabsPage),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/instructor/dashboard/instructor-dashboard.page').then(
            (m) => m.InstructorDashboardPage,
          ),
      },
      {
        path: 'slots',
        loadComponent: () =>
          import('./features/instructor/slots/manage-slots.page').then((m) => m.ManageSlotsPage),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/instructor/bookings/instructor-bookings.page').then(
            (m) => m.InstructorBookingsPage,
          ),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/instructor/students/student-list.page').then(
            (m) => m.StudentListPage,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
    ],
  },
  {
    path: 'learner',
    canActivate: [authGuard, roleGuard('LEARNER')],
    loadComponent: () =>
      import('./features/learner/learner-tabs.page').then((m) => m.LearnerTabsPage),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/learner/dashboard/learner-dashboard.page').then(
            (m) => m.LearnerDashboardPage,
          ),
      },
      {
        path: 'book',
        loadComponent: () =>
          import('./features/learner/book/book-slot.page').then((m) => m.BookSlotPage),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/learner/bookings/my-bookings.page').then((m) => m.MyBookingsPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
