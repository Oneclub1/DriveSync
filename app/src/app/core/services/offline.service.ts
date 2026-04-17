import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Offline-Cache mit localStorage (Web) bzw. Capacitor Preferences (Native).
 * Speichert API-Responses lokal damit sie offline verfügbar sind.
 */
@Injectable({ providedIn: 'root' })
export class OfflineService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    window.addEventListener('online', () => this.isOnlineSubject.next(true));
    window.addEventListener('offline', () => this.isOnlineSubject.next(false));
  }

  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  /**
   * Speichert beliebige Daten unter einem Key im lokalen Cache.
   */
  set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify({
        data,
        cachedAt: Date.now(),
      }));
    } catch (e) {
      console.error('[Offline] Cache-Schreibfehler:', e);
    }
  }

  /**
   * Lädt Daten aus dem Cache. Optional: maxAgeMs prüft Alter des Caches.
   */
  get<T>(key: string, maxAgeMs?: number): T | null {
    try {
      const raw = localStorage.getItem(`cache:${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: T; cachedAt: number };
      if (maxAgeMs && Date.now() - parsed.cachedAt > maxAgeMs) {
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  clear(prefix?: string): void {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k.startsWith('cache:') && (!prefix || k.startsWith(`cache:${prefix}`))) {
        localStorage.removeItem(k);
      }
    });
  }
}
