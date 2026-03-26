import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(role: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.currentUser?.role === role) {
      return true;
    }

    // Redirect zum richtigen Dashboard
    if (auth.currentUser?.role === 'INSTRUCTOR') {
      router.navigate(['/instructor']);
    } else if (auth.currentUser?.role === 'LEARNER') {
      router.navigate(['/learner']);
    } else {
      router.navigate(['/login']);
    }

    return false;
  };
}
