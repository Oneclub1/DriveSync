import webpush from 'web-push';
import { config } from '../config';

let initialized = false;

function init() {
  if (initialized) return;
  if (config.push.publicKey && config.push.privateKey) {
    webpush.setVapidDetails(
      `mailto:${config.smtp.from}`,
      config.push.publicKey,
      config.push.privateKey,
    );
    initialized = true;
  }
}

export async function sendPushNotification(
  subscriptionJson: string,
  title: string,
  body: string,
) {
  init();
  if (!initialized) {
    console.log('[Push] VAPID-Keys nicht konfiguriert - Push übersprungen');
    return;
  }

  const subscription = JSON.parse(subscriptionJson);
  const payload = JSON.stringify({ title, body });

  try {
    await webpush.sendNotification(subscription, payload);
  } catch (e: any) {
    if (e.statusCode === 410 || e.statusCode === 404) {
      // Subscription expired/invalid - sollte aus DB entfernt werden
      throw new Error('SUBSCRIPTION_EXPIRED');
    }
    throw e;
  }
}

export function getVapidPublicKey() {
  return config.push.publicKey || '';
}
