import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

/**
 * Stripe-Stub. Für echten Betrieb: Stripe SDK installieren (npm i stripe)
 * und ENV-Vars STRIPE_SECRET_KEY etc. setzen.
 *
 * Aktuell simulieren wir Zahlungen für Demo-Zwecke.
 */

export async function createPaymentIntent(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { timeSlot: true },
  });

  if (!booking) throw new AppError(404, 'Buchung nicht gefunden');
  if (booking.learnerId !== userId) throw new AppError(403, 'Keine Berechtigung');
  if (booking.paymentStatus === 'PAID') {
    throw new AppError(400, 'Bereits bezahlt');
  }

  const amount = booking.paymentAmount || config.booking.defaultLessonPriceEur;

  if (!config.stripe.secretKey) {
    // Demo-Modus: direkt als bezahlt markieren (NICHT in Produktion!)
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        paymentAmount: amount,
        paymentRef: `demo_${Date.now()}`,
      },
    });
    return {
      mode: 'demo',
      clientSecret: null,
      amount,
      message: 'Demo-Modus: Zahlung wurde simuliert. Für echte Zahlungen STRIPE_SECRET_KEY in .env setzen.',
    };
  }

  // Echte Stripe-Integration würde hier passieren:
  // const stripe = new Stripe(config.stripe.secretKey);
  // const intent = await stripe.paymentIntents.create({
  //   amount: Math.round(amount * 100),
  //   currency: 'eur',
  //   metadata: { bookingId, userId },
  // });
  // await prisma.booking.update({
  //   where: { id: bookingId },
  //   data: { paymentStatus: 'PENDING', paymentAmount: amount, paymentRef: intent.id },
  // });
  // return { mode: 'stripe', clientSecret: intent.client_secret, amount };

  throw new AppError(501, 'Stripe noch nicht implementiert. Demo-Modus aktivieren durch Entfernen von STRIPE_SECRET_KEY.');
}

export async function getPaymentStatus(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new AppError(404, 'Buchung nicht gefunden');
  if (booking.learnerId !== userId) throw new AppError(403, 'Keine Berechtigung');

  return {
    status: booking.paymentStatus || 'NONE',
    amount: booking.paymentAmount,
    ref: booking.paymentRef,
  };
}
