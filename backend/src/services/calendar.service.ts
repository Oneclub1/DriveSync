import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/**
 * Generiert einen ICS-Feed für alle aktiven Buchungen eines Users.
 * Funktioniert für Learner (eigene Buchungen) UND Instructor (alle seine Slots).
 */
export async function generateICSFeed(userId: string, role: string): Promise<string> {
  let events: Array<{
    id: string;
    summary: string;
    start: Date;
    end: Date;
    description: string;
  }> = [];

  if (role === 'LEARNER') {
    const bookings = await prisma.booking.findMany({
      where: {
        learnerId: userId,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      },
      include: { timeSlot: { include: { instructor: true } } },
    });

    events = bookings.map((b) => ({
      id: `booking-${b.id}@drivesync.app`,
      summary: `Fahrstunde bei ${b.timeSlot.instructor.firstName} ${b.timeSlot.instructor.lastName}`,
      start: b.timeSlot.startTime,
      end: b.timeSlot.endTime,
      description: `Status: ${b.status}${b.notes ? '\n' + b.notes : ''}`,
    }));
  } else {
    const slots = await prisma.timeSlot.findMany({
      where: { instructorId: userId },
      include: {
        booking: { include: { learner: true } },
      },
    });

    events = slots.map((s) => {
      const learnerName = s.booking
        ? `${s.booking.learner.firstName} ${s.booking.learner.lastName}`
        : 'Frei';
      return {
        id: `slot-${s.id}@drivesync.app`,
        summary: s.slotType === 'LESSON' ? `Fahrstunde: ${learnerName}` : s.slotType,
        start: s.startTime,
        end: s.endTime,
        description: s.booking ? `Buchung: ${s.booking.status}` : 'Frei',
      };
    });
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DriveSync//Calendar//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:DriveSync',
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  for (const ev of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(ev.start)}`,
      `DTEND:${formatICSDate(ev.end)}`,
      `SUMMARY:${escapeICS(ev.summary)}`,
      `DESCRIPTION:${escapeICS(ev.description)}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
