import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Instructor erstellen
  const instructorHash = await bcrypt.hash('Test1234!', 12);
  const instructor = await prisma.user.upsert({
    where: { email: 'fahrlehrer@test.com' },
    update: {},
    create: {
      email: 'fahrlehrer@test.com',
      passwordHash: instructorHash,
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'INSTRUCTOR',
      phoneNumber: '+49 170 1234567',
    },
  });
  console.log(`Instructor: ${instructor.email}`);

  // Learner erstellen
  const learnerHash = await bcrypt.hash('Test1234!', 12);
  const learner1 = await prisma.user.upsert({
    where: { email: 'schueler1@test.com' },
    update: {},
    create: {
      email: 'schueler1@test.com',
      passwordHash: learnerHash,
      firstName: 'Anna',
      lastName: 'Schmidt',
      role: 'LEARNER',
    },
  });
  console.log(`Learner 1: ${learner1.email}`);

  const learner2 = await prisma.user.upsert({
    where: { email: 'schueler2@test.com' },
    update: {},
    create: {
      email: 'schueler2@test.com',
      passwordHash: learnerHash,
      firstName: 'Ben',
      lastName: 'Weber',
      role: 'LEARNER',
    },
  });
  console.log(`Learner 2: ${learner2.email}`);

  // Zuordnungen
  await prisma.instructorLearner.upsert({
    where: { instructorId_learnerId: { instructorId: instructor.id, learnerId: learner1.id } },
    update: {},
    create: { instructorId: instructor.id, learnerId: learner1.id },
  });
  await prisma.instructorLearner.upsert({
    where: { instructorId_learnerId: { instructorId: instructor.id, learnerId: learner2.id } },
    update: {},
    create: { instructorId: instructor.id, learnerId: learner2.id },
  });
  console.log('Zuordnungen erstellt');

  // TimeSlots für die nächsten 2 Wochen (Mo-Fr, 9-17 Uhr, je 90 Min)
  const now = new Date();
  const slotIds: string[] = [];

  for (let day = 1; day <= 14; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);

    // Nur Werktage (Mo-Fr)
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (let hour = 9; hour <= 15; hour += 2) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(hour + 1, 30, 0, 0);

      const slot = await prisma.timeSlot.create({
        data: {
          instructorId: instructor.id,
          startTime,
          endTime,
          slotType: 'LESSON',
        },
      });
      slotIds.push(slot.id);
    }
  }
  console.log(`${slotIds.length} TimeSlots erstellt`);

  // 2 Buchungen erstellen
  if (slotIds.length >= 2) {
    await prisma.booking.create({
      data: {
        learnerId: learner1.id,
        timeSlotId: slotIds[0],
        status: 'CONFIRMED',
      },
    });
    await prisma.timeSlot.update({
      where: { id: slotIds[0] },
      data: { isAvailable: false },
    });

    await prisma.booking.create({
      data: {
        learnerId: learner2.id,
        timeSlotId: slotIds[2],
        status: 'PENDING',
      },
    });
    await prisma.timeSlot.update({
      where: { id: slotIds[2] },
      data: { isAvailable: false },
    });

    console.log('2 Buchungen erstellt');
  }

  console.log('Seed abgeschlossen!');
  console.log('\nTest-Accounts:');
  console.log('  Fahrlehrer: fahrlehrer@test.com / Test1234!');
  console.log('  Schüler 1:  schueler1@test.com / Test1234!');
  console.log('  Schüler 2:  schueler2@test.com / Test1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
