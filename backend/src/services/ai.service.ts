import { config } from '../config';

interface ReminderContext {
  learnerName: string;
  instructorName: string;
  startTime: Date;
  hoursBefore: number;
}

/**
 * Generiert eine personalisierte Erinnerungsnachricht.
 * Nutzt Claude API wenn ANTHROPIC_API_KEY gesetzt ist, sonst Fallback-Template.
 */
export async function generateAIReminder(ctx: ReminderContext): Promise<string> {
  const dateStr = ctx.startTime.toLocaleString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!config.ai.apiKey) {
    return fallbackReminder(ctx, dateStr);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.ai.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `Du bist Assistent einer Fahrschul-App. Schreibe eine kurze, freundliche Erinnerung auf Deutsch (max 3 Sätze) für ${ctx.learnerName}. Die Fahrstunde ist am ${dateStr} bei Fahrlehrer ${ctx.instructorName}, also in ca. ${ctx.hoursBefore} Stunden. Erinnere an pünktliches Erscheinen, Führerschein/Ausweis mitbringen und ggf. Stornierungsfrist falls noch möglich. Du-Form, locker aber respektvoll. Gib NUR die Nachricht zurück, ohne Anrede-Zeile.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[AI] Claude API Fehler:', await response.text());
      return fallbackReminder(ctx, dateStr);
    }

    const data: any = await response.json();
    const text = data.content?.[0]?.text;
    return text || fallbackReminder(ctx, dateStr);
  } catch (e) {
    console.error('[AI] Fehler beim Generieren:', e);
    return fallbackReminder(ctx, dateStr);
  }
}

function fallbackReminder(ctx: ReminderContext, dateStr: string): string {
  return `Hallo ${ctx.learnerName}, kurze Erinnerung: Deine Fahrstunde bei ${ctx.instructorName} ist am ${dateStr}. Bitte sei pünktlich und denk an deinen Ausweis. Bis gleich!`;
}
