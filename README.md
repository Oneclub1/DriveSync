# DriveSync

**DriveSync** ist eine proprietäre Fahrstunden-Buchungsplattform für Fahrschulen. Die App ermöglicht Fahrschülern (Learners), Fahrstunden online zu buchen und zu stornieren, und Fahrlehrern (Instructors), verfügbare Zeitfenster, Sperrzeiten und Kalender zu verwalten. Langfristig deckt DriveSync alle Funktionen von fahrstundenplaner.de ab und bietet eine moderne, plattformübergreifende Lösung (Web, iOS, Android).

---

## Architektur-Überblick

DriveSync folgt einer klassischen Client-Server-Architektur mit Kalender-Integration:

```
┌─────────────────────────────────────┐
│  Ionic App (PWA/iOS/Android)        │
│  Angular + Capacitor                │
└──────────────┬──────────────────────┘
               │ HTTPS/REST
               ▼
┌─────────────────────────────────────┐
│  .NET 8 Web API                     │
│  JWT Auth, Business Logic           │
└──────────────┬──────────────────────┘
               │ EF Core
               ▼
┌─────────────────────────────────────┐
│  PostgreSQL / SQLite                │
│  User, TimeSlot, Booking            │
└─────────────────────────────────────┘
               │ ICS Export
               ▼
┌─────────────────────────────────────┐
│  Calendar Feed (ICS v1)             │
│  Google / Outlook Sync (v2)         │
└─────────────────────────────────────┘
```

---

## Tech-Stack

### Frontend
- **Framework:** Ionic 8 + Angular 18 + Capacitor 6
- **UI:** Ionic Components, Custom Design System
- **State Management:** RxJS, Signals
- **HTTP:** Angular HttpClient
- **Plattformen:** PWA, iOS (via Capacitor), Android (via Capacitor)

### Backend
- **Runtime:** .NET 8
- **Framework:** ASP.NET Core Web API
- **ORM:** Entity Framework Core 8
- **Datenbank:** PostgreSQL (Production), SQLite (Development)
- **Auth:** JWT Bearer Tokens
- **E-Mail:** SMTP (Sendgrid geplant für v2)
- **Kalender:** ICS-Feed (v1), Google/Outlook API (v2)

### Infrastruktur
- **Versionskontrolle:** Git (private Repository)
- **CI/CD:** GitHub Actions (geplant)
- **Hosting:** EU-basiert (DSGVO-konform)
- **API-Dokumentation:** Swagger/OpenAPI

---

## Lokales Setup

### Voraussetzungen
- **Node.js:** 20.x oder höher
- **npm:** 10.x oder höher
- **.NET SDK:** 8.0 oder höher
- **Ionic CLI:** 7.x oder höher
- **Git:** Aktuelle Version

### Installation

#### 1. Repository klonen
```bash
git clone <repository-url>
cd DriveSync
```

#### 2. Frontend (Ionic App) einrichten
```bash
cd app
npm install
ionic serve
```
Die App läuft auf `http://localhost:8100`

#### 3. Backend (.NET API) einrichten
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```
Die API läuft auf `https://localhost:7243`

#### 4. Initiale Testdaten (optional)
```bash
cd backend
dotnet run --seed
```

---

## Environments

### Frontend-Konfiguration

**`app/src/environments/environment.ts`** (Development):
```typescript
export const environment = {
  production: false,
  apiBase: 'https://localhost:7243/api'
};
```

**`app/src/environments/environment.prod.ts`** (Production):
```typescript
export const environment = {
  production: true,
  apiBase: 'https://api.drivesync.app/api'
};
```

### Backend-Konfiguration

**`backend/appsettings.json`**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=drivesync.db"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyWith32Characters!",
    "Issuer": "DriveSync",
    "Audience": "DriveSync",
    "ExpirationMinutes": 1440
  },
  "Smtp": {
    "Host": "smtp.example.com",
    "Port": 587,
    "Username": "",
    "Password": ""
  }
}
```

**`backend/appsettings.Development.json`**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=drivesync.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

---

## Design-System & UI-Konventionen

### Farbpalette
```css
--primary:       #2563eb    /* Blau - Primäre Aktionen */
--primary-shade: #1e40af
--primary-tint:  #3b82f6

--secondary:     #10b981    /* Grün - Erfolg/Verfügbarkeit */
--warning:       #f59e0b    /* Orange - Warnungen */
--danger:        #ef4444    /* Rot - Storno/Fehler */

--light:         #f3f4f6    /* Hintergründe */
--medium:        #9ca3af    /* Sekundärtext */
--dark:          #1f2937    /* Primärtext */
```

### Typografie
- **Schriftart:** System-Stack (SF Pro / Roboto / Segoe UI)
- **Größen:**
  - `--font-xs:  12px`
  - `--font-sm:  14px`
  - `--font-base: 16px`
  - `--font-lg:  18px`
  - `--font-xl:  24px`
  - `--font-2xl: 32px`

### Spacing-Scale
```css
--space-xs:  4px
--space-sm:  8px
--space-md:  16px
--space-lg:  24px
--space-xl:  32px
--space-2xl: 48px
```

### Modal-Template
Alle Modals folgen dieser Struktur (max. 600px Breite):

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Modal-Titel</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">
        <ion-icon name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <!-- Body Content -->
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-buttons slot="end">
      <ion-button fill="clear" (click)="dismiss()">Abbrechen</ion-button>
      <ion-button fill="solid" (click)="submit()">Bestätigen</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-footer>
```

---

## Domänenmodell

### User
| Feld            | Typ          | Beschreibung                                      |
|-----------------|--------------|---------------------------------------------------|
| `Id`            | `Guid`       | Primärschlüssel                                   |
| `Email`         | `string`     | Unique, Login-Identifikator                       |
| `PasswordHash`  | `string`     | BCrypt-Hash                                       |
| `FirstName`     | `string`     | Vorname                                           |
| `LastName`      | `string`     | Nachname                                          |
| `Role`          | `UserRole`   | `Learner` oder `Instructor`                       |
| `PhoneNumber`   | `string?`    | Optional                                          |
| `CreatedAt`     | `DateTime`   | Registrierungsdatum                               |
| `IsActive`      | `bool`       | Account-Status                                    |

### TimeSlot
| Feld            | Typ          | Beschreibung                                      |
|-----------------|--------------|---------------------------------------------------|
| `Id`            | `Guid`       | Primärschlüssel                                   |
| `InstructorId`  | `Guid`       | FK zu User (Instructor)                           |
| `StartTime`     | `DateTime`   | Beginn des Zeitfensters                           |
| `EndTime`       | `DateTime`   | Ende des Zeitfensters                             |
| `IsAvailable`   | `bool`       | Buchbar oder gesperrt                             |
| `SlotType`      | `SlotType`   | `Lesson`, `Blocked`, `Break`                      |
| `CreatedAt`     | `DateTime`   | Erstellungsdatum                                  |

### Booking
| Feld            | Typ            | Beschreibung                                      |
|-----------------|----------------|---------------------------------------------------|
| `Id`            | `Guid`         | Primärschlüssel                                   |
| `LearnerId`     | `Guid`         | FK zu User (Learner)                              |
| `TimeSlotId`    | `Guid`         | FK zu TimeSlot                                    |
| `Status`        | `BookingStatus`| `Pending`, `Confirmed`, `Cancelled`, `Completed`  |
| `BookedAt`      | `DateTime`     | Buchungszeitpunkt                                 |
| `CancelledAt`   | `DateTime?`    | Stornierungszeitpunkt (falls zutreffend)          |
| `Notes`         | `string?`      | Optional: Notizen                                 |

### Geschäftsregeln
- **Stornierung:** Nur möglich, wenn ≥ 24 Stunden vor `StartTime`
- **Wochenlimit:** Fahrschüler können max. 3 Fahrstunden/Woche buchen (konfigurierbar)
- **Überschneidungen:** Ein TimeSlot kann nur einmal gebucht werden
- **Rollenbasiert:** Nur Instructors dürfen TimeSlots erstellen/löschen

---

## API-Endpunkte v1

### Authentication
| Methode | Endpunkt                  | Auth     | Beschreibung                              |
|---------|---------------------------|----------|-------------------------------------------|
| `POST`  | `/api/auth/login`         | Public   | Login (Email + Password) → JWT            |
| `POST`  | `/api/auth/register-learner` | Public | Fahrschüler-Registrierung                |
| `GET`   | `/api/auth/me`            | Bearer   | Aktueller User-Info                       |

### TimeSlots
| Methode | Endpunkt                  | Auth         | Beschreibung                              |
|---------|---------------------------|--------------|-------------------------------------------|
| `GET`   | `/api/slots/available`    | Learner      | Verfügbare Zeitfenster (Datum-Filter)     |
| `POST`  | `/api/slots`              | Instructor   | Neues Zeitfenster erstellen               |
| `DELETE`| `/api/slots/{id}`         | Instructor   | Zeitfenster löschen                       |
| `GET`   | `/api/slots/instructor`   | Instructor   | Alle eigenen Slots                        |

### Bookings
| Methode | Endpunkt                  | Auth         | Beschreibung                              |
|---------|---------------------------|--------------|-------------------------------------------|
| `POST`  | `/api/bookings`           | Learner      | Fahrstunde buchen                         |
| `GET`   | `/api/bookings/mine`      | Learner      | Eigene Buchungen                          |
| `DELETE`| `/api/bookings/{id}`      | Learner      | Buchung stornieren (24h-Regel)            |
| `GET`   | `/api/bookings/instructor`| Instructor   | Alle Buchungen des Instructors            |
| `PATCH` | `/api/bookings/{id}/confirm` | Instructor | Buchung bestätigen                        |

### Calendar
| Methode | Endpunkt                  | Auth         | Beschreibung                              |
|---------|---------------------------|--------------|-------------------------------------------|
| `GET`   | `/api/calendar/ics`       | Bearer       | ICS-Feed (alle eigenen Buchungen)         |

---

## Security & Datenschutz

### Authentifizierung & Autorisierung
- **JWT Bearer Tokens:** Signiert mit HS256, Expiration: 24h
- **Rollenbasierte Zugriffskontrolle:** `Learner` vs. `Instructor`
- **Password-Hashing:** BCrypt mit Salt (Cost-Factor: 12)

### DSGVO-Konformität
- **EU-Hosting:** Alle Server in der EU (DSGVO Art. 44)
- **Datenminimierung:** Nur notwendige Daten werden erfasst
- **Auskunftsrecht:** API-Endpunkt `/api/gdpr/export` (geplant v2)
- **Löschung:** Account-Löschung entfernt alle personenbezogenen Daten

### Lizenz & Nutzungsbedingungen
- **Proprietär:** Kein Open Source – siehe `LICENSE.txt`
- **EULA:** Endbenutzer-Lizenzvereinbarung in `EULA.txt`
- **Copyright:** © 2025 DriveSync. Alle Rechte vorbehalten.

---

## Branching & Commits

### Branch-Strategie
- **`main`:** Stabile Releases (protected)
- **`dev`:** Integration-Branch für Features
- **`feat/*`:** Feature-Branches (z.B. `feat/calendar-sync`)
- **`fix/*`:** Bugfix-Branches (z.B. `fix/booking-validation`)
- **`chore/*`:** Wartung & Refactoring

### Commit-Konventionen (Conventional Commits)
```
<type>(<scope>): <subject>

<body>
```

**Typen:**
- `feat`: Neues Feature
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Formatierung
- `refactor`: Code-Refactoring
- `test`: Tests hinzufügen/ändern
- `chore`: Build-Prozess, Tools

**Beispiele:**
```
feat(booking): add 24h cancellation rule
fix(auth): resolve JWT expiration bug
docs(readme): update setup instructions
```

---

## Tests & Qualität

### Frontend
- **Linting:** ESLint + Angular ESLint Plugin
- **Formatierung:** Prettier
- **Unit Tests:** Jasmine + Karma (geplant)
- **E2E Tests:** Cypress (geplant)

### Backend
- **Linting:** .NET Analyzers
- **Unit Tests:** xUnit + Moq (geplant)
- **Integration Tests:** WebApplicationFactory (geplant)

### API-Dokumentation
- **Swagger UI:** `https://localhost:7243/swagger`
- **OpenAPI Spec:** `https://localhost:7243/swagger/v1/swagger.json`
- **Postman Collection:** `docs/DriveSync.postman_collection.json` (geplant)

### Qualitätskriterien
- Alle neuen Features müssen API-Tests haben
- Code-Coverage-Ziel: >80% (ab v2)
- Swagger-Dokumentation muss vollständig sein

---

## Roadmap

### v1 MVP (Q2 2025)
- ✅ User-Authentifizierung (JWT)
- ✅ Rollenbasierte Autorisierung (Learner/Instructor)
- ✅ TimeSlot-Verwaltung
- ✅ Buchungssystem mit 24h-Stornierungsregel
- ✅ ICS-Kalender-Export
- ✅ Ionic App (PWA)

### v2 Kalender-Sync (Q3 2025)
- ⏳ Google Calendar API-Integration
- ⏳ Outlook Calendar API-Integration
- ⏳ E-Mail-Benachrichtigungen (Sendgrid)
- ⏳ Push-Notifications (Capacitor)

### v3 Mobile Apps (Q4 2025)
- ⏳ iOS App (App Store)
- ⏳ Android App (Google Play)
- ⏳ Offline-Modus (Capacitor Storage)

### v4 Erweiterte Features (2026)
- ⏳ Fahrzeugverwaltung
- ⏳ Theoriestunden-Buchung
- ⏳ Warteliste für ausgebuchte Slots
- ⏳ Zahlungsintegration (Stripe)

### v5 Analytics & Reporting (2026+)
- ⏳ Admin-Dashboard
- ⏳ Statistiken & Reports
- ⏳ Export-Funktionen (CSV, PDF)
- ⏳ Multi-Fahrschule-Support

---

## Lizenz & Rechtliches

**DriveSync ist proprietäre Software.** Der Quellcode und die Anwendung unterliegen dem Copyright des Rechteinhabers.

- **Lizenz:** Siehe `LICENSE.txt` für vollständige Lizenzbestimmungen
- **EULA:** Endbenutzer müssen `EULA.txt` akzeptieren
- **Keine Redistribution:** Vervielfältigung, Verbreitung oder Veröffentlichung ohne ausdrückliche Genehmigung ist untersagt

Für Lizenzanfragen kontaktieren Sie: `legal@drivesync.app`

---

## Contribution Guide

### Issue-Typen
Verwenden Sie die folgenden Labels beim Erstellen von Issues:

- **`bug`:** Fehler in bestehender Funktionalität
- **`feature`:** Neue Funktion oder Enhancement
- **`docs`:** Dokumentation fehlt oder ist fehlerhaft
- **`refactor`:** Code-Verbesserung ohne Funktionsänderung
- **`performance`:** Performance-Optimierung
- **`security`:** Sicherheitslücke (privat melden!)

### Pull Request Kriterien
Bevor ein PR gemerged werden kann, muss er folgende Kriterien erfüllen:

1. **Branch:** Feature-Branch basiert auf `dev` (nicht `main`)
2. **Commits:** Conventional Commits verwendet
3. **Code-Style:** ESLint/Prettier (Frontend) oder .NET Analyzers (Backend) ohne Fehler
4. **Build:** `npm run build` (Frontend) und `dotnet build` (Backend) erfolgreich
5. **Swagger:** API-Änderungen sind in Swagger dokumentiert
6. **Review:** Mindestens 1 Approval von Code Owner
7. **Testing:** Manuelle Tests durchgeführt (automatisierte Tests ab v2)

### PR-Template
```markdown
## Beschreibung
<!-- Was wurde geändert und warum? -->

## Issue
Closes #<issue-nummer>

## Testing
<!-- Wie wurde getestet? Screenshots bei UI-Änderungen -->

## Checklist
- [ ] Conventional Commits verwendet
- [ ] Linter läuft ohne Fehler
- [ ] Build erfolgreich
- [ ] Swagger aktualisiert (bei API-Änderungen)
- [ ] Manuell getestet
```

---

## Changelog

DriveSync folgt [Keep a Changelog](https://keepachangelog.com/) und [Semantic Versioning](https://semver.org/) (vereinfacht für private Projekte).

Alle wichtigen Änderungen werden in `CHANGELOG.md` dokumentiert.

**Format:**
```markdown
## [1.0.0] - 2025-06-15

### Added
- User-Authentifizierung mit JWT
- Buchungssystem mit 24h-Stornierungsregel

### Changed
- API-Base-URL auf HTTPS umgestellt

### Fixed
- TimeSlot-Überschneidungsprüfung korrigiert
```

---

## Support & Kontakt

Für Fragen, Bug-Reports oder Feature-Requests:

- **Issues:** Verwenden Sie das GitHub Issue Tracking System
- **E-Mail:** `support@drivesync.app`
- **Dokumentation:** Siehe `/docs` für erweiterte Guides

---

**© 2025 DriveSync. Alle Rechte vorbehalten. Proprietäre Software – siehe LICENSE.txt**
