/**
 * api/kontakt.js — Serverless handler for Bulevar.IT contact inquiries (Vercel / Netlify)
 * 
 * Env variables:
 * - RESEND_API_KEY (Resend API key)
 * - CONTACT_EMAIL (Destination email, defaults to bulevarit@gmail.com)
 * - WHATSAPP_API_TOKEN (Optional WhatsApp Cloud API token)
 * - WHATSAPP_PHONE_ID (Optional WhatsApp Phone Number ID)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { ime, telefon, email, imaIdeju, ideja, problemi, kontakt, url, utm, website } = data || {};

    // 1. Anti-spam honeypot
    if (website) {
      return res.status(200).json({ ok: true, spamBlocked: true });
    }

    // 2. Validate required fields
    if (!ime || !telefon || !email) {
      return res.status(400).json({ error: 'Sva polja su obavezna (ime, telefon, email)' });
    }

    const recipient = process.env.CONTACT_EMAIL || 'bulevarit@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    const utmText = utm && Object.keys(utm).length > 0
      ? Object.entries(utm).map(([k, v]) => `• ${k}: ${v}`).join('\n')
      : 'Nema UTM parametara';

    const problemiText = Array.isArray(problemi) && problemi.length > 0
      ? problemi.map((p) => `• ${p}`).join('\n')
      : 'Nije odabrano';

    const emailSubject = `Novi upit sa sajta: ${ime} (${telefon})`;
    const emailBody = `
Novi upit sa Bulevar.IT web sajta:
─────────────────────────────────────
Ime: ${ime}
Telefon: ${telefon}
Email: ${email}
Željeni kontakt: ${kontakt || 'Poziv'}

Ideja / Problemi:
─────────────────
Ima ideju: ${imaIdeju || 'Nije odabrao'}
${imaIdeju === 'Da' ? `Opis ideje:\n${ideja || '/'}` : `Izabrani problemi:\n${problemiText}`}

Dodatni podaci:
───────────────
URL stranice: ${url || '/'}
UTM parametri:
${utmText}
─────────────────────────────────────
Datum i vreme: ${new Date().toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' })}
    `.trim();

    // 3. Send via Resend if API key is present
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Bulevar.IT Upit <upiti@bulevar.it>',
          to: [recipient],
          reply_to: email,
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('[Resend Error]', errText);
        return res.status(502).json({ error: 'Greška pri slanju emaila preko provajdera' });
      }
    } else {
      console.warn('[Bulevar.IT] RESEND_API_KEY nije podešen u env varijablama. Podaci upita:', data);
    }

    // 4. WhatsApp Cloud API notification (prepared as optional step; uncomment when credentials are provided)
    /*
    if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TO_NUMBER) {
      try {
        await fetch(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: process.env.WHATSAPP_TO_NUMBER,
            type: 'text',
            text: { body: `*Novi upit (Bulevar.IT)*\n${ime} (${telefon})\nEmail: ${email}\nNačin: ${kontakt}\n${imaIdeju === 'Da' ? ideja : problemiText}` },
          }),
        });
      } catch (waErr) {
        console.error('[WhatsApp Notification Error]', waErr);
      }
    }
    */

    return res.status(200).json({ ok: true, message: 'Upit uspešno poslat' });
  } catch (error) {
    console.error('[Kontakt API Error]', error);
    return res.status(500).json({ error: 'Interna greška servera' });
  }
}
