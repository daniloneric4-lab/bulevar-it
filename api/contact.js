/**
 * api/contact.js — Vercel serverless funkcija (Node.js runtime) za kontakt formu Bulevar.IT
 *
 * 1) Upisuje svaki upit u Neon Postgres bazu (tabela `upiti`, pravi se automatski).
 * 2) Šalje obaveštenje mejlom preko Resend-a na CONTACT_TO (reply-to = email klijenta).
 *
 * Env varijable (Vercel): DATABASE_URL, RESEND_API_KEY, CONTACT_TO
 *
 * Prima POST JSON sa poljima iz forme:
 *   ime*, email*, telefon, firma, ideja (poruka), imaIdeju, problemi[], kontakt,
 *   cilj, delatnost (landing forme), stranica, jezik, website (honeypot),
 *   ucitano (vreme učitavanja forme, ms), poslato (vreme slanja, ms), utm {}
 *
 * Odgovori: 200 {ok:true} | 400 {ok:false,error} | 405 | 500 {ok:false,error} (samo ako ni baza ni mejl ne uspeju)
 */

import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const MAX_PORUKA = 5000;
const MAX_POLJE = 300;
const MIN_FILL_MS = 3000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FROM = 'Bulevar.IT sajt <onboarding@resend.dev>';

/* ───────────────────────── baza ───────────────────────── */

let sqlClient = null;
let tableReady = null;

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL nije podešen');
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

function ensureTable(sql) {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS upiti (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ime TEXT NOT NULL, email TEXT NOT NULL, telefon TEXT, firma TEXT,
        usluga TEXT, poruka TEXT, stranica TEXT, jezik TEXT,
        status TEXT NOT NULL DEFAULT 'novo'
      )
    `.catch((err) => {
      tableReady = null; // sledeći poziv pokušava ponovo
      throw err;
    });
  }
  return tableReady;
}

async function saveToDb(u) {
  const sql = getSql();
  await ensureTable(sql);
  // Tagged template => parametrizovan upit (vrednosti se nikad ne lepe u SQL tekst)
  const rows = await sql`
    INSERT INTO upiti (ime, email, telefon, firma, usluga, poruka, stranica, jezik)
    VALUES (${u.ime}, ${u.email}, ${u.telefon}, ${u.firma}, ${u.usluga}, ${u.poruka}, ${u.stranica}, ${u.jezik})
    RETURNING id
  `;
  return rows?.[0]?.id ?? null;
}

/* ───────────────────────── mejl ───────────────────────── */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function oneLine(value) {
  return String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim();
}

function formatBelgrade(date) {
  try {
    return new Intl.DateTimeFormat('sr-Latn-RS', {
      timeZone: 'Europe/Belgrade',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' });
  }
}

async function sendMail(u, meta) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY nije podešen');
  const to = (process.env.CONTACT_TO || 'bulevarit@gmail.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const vreme = formatBelgrade(meta.date);
  const subject = oneLine(`Novi upit: ${u.ime}${u.firma ? ` - ${u.firma}` : ''}`).slice(0, 250);

  const fields = [
    ['Ime', u.ime],
    ['Email', u.email],
    ['Telefon', u.telefon],
    ['Firma', u.firma],
    ['Šta traže / usluga', u.usluga],
    ['Poruka', u.poruka],
    ['Stranica', u.stranica],
    ['Jezik', u.jezik],
    ['Datum i vreme', `${vreme} (Europe/Belgrade)`],
  ];
  if (meta.utm) fields.push(['UTM / izvor', meta.utm]);
  if (meta.id) fields.push(['ID u bazi', `#${meta.id}`]);

  const text = [
    'Novi upit sa sajta Bulevar.IT',
    '------------------------------',
    ...fields.map(([k, v]) => `${k}: ${v || '-'}`),
    '',
    'Odgovorite direktno na ovaj mejl da biste pisali klijentu.',
  ].join('\n');

  const rowsHtml = fields
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;white-space:pre-wrap;word-break:break-word;">${v ? escapeHtml(v) : '<span style="color:#9ca3af">-</span>'}</td>
        </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
    <tr><td style="background:#191F32;padding:18px 20px;color:#D9B25F;font-size:16px;font-weight:bold;">Novi upit sa sajta Bulevar.IT</td></tr>
    <tr><td style="padding:8px 8px 4px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rowsHtml}
      </table>
    </td></tr>
    <tr><td style="padding:14px 20px 18px;color:#6b7280;font-size:12px;">Odgovorite direktno na ovaj mejl da biste pisali klijentu (${escapeHtml(u.email)}).</td></tr>
  </table>
</body></html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: u.email,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(`Resend: ${error.name || ''} ${error.message || JSON.stringify(error)}`.trim());
  }
  return data?.id ?? null;
}

/* ───────────────────────── validacija ───────────────────────── */

function clean(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim();
}

function buildUsluga(body) {
  const direct = clean(body.usluga);
  if (direct) return direct;

  const parts = [];
  const imaIdeju = clean(body.imaIdeju);
  if (imaIdeju) parts.push(`Ideja: ${imaIdeju}`);

  const problemi = Array.isArray(body.problemi)
    ? body.problemi.map(clean).filter(Boolean).slice(0, 10)
    : [];
  if (problemi.length) parts.push(`Muči ih: ${problemi.join(', ')}`);

  const cilj = clean(body.cilj);
  if (cilj) parts.push(`Cilj: ${cilj}`);
  const delatnost = clean(body.delatnost);
  if (delatnost) parts.push(`Delatnost: ${delatnost}`);
  const kontakt = clean(body.kontakt);
  if (kontakt) parts.push(`Željeni kontakt: ${kontakt}`);

  return parts.join(' | ');
}

function validate(body) {
  const u = {
    ime: clean(body.ime),
    email: clean(body.email),
    telefon: clean(body.telefon),
    firma: clean(body.firma),
    poruka: clean(body.poruka ?? body.ideja ?? body.message),
    stranica: clean(body.stranica),
    jezik: clean(body.jezik).toLowerCase() === 'en' ? 'en' : 'sr',
  };

  if (!u.ime) return { error: 'Ime je obavezno.' };
  if (!u.email) return { error: 'Email je obavezan.' };
  if (u.email.length > MAX_POLJE || !EMAIL_RE.test(u.email)) return { error: 'Email nije u ispravnom formatu.' };
  if (u.poruka.length > MAX_PORUKA) return { error: `Poruka može imati najviše ${MAX_PORUKA} znakova.` };

  const shortFields = [
    u.ime, u.telefon, u.firma, u.stranica,
    clean(body.imaIdeju), clean(body.kontakt), clean(body.cilj), clean(body.delatnost), clean(body.usluga),
    ...(Array.isArray(body.problemi) ? body.problemi.map(clean) : []),
  ];
  if (shortFields.some((f) => f.length > MAX_POLJE)) {
    return { error: `Polja mogu imati najviše ${MAX_POLJE} znakova.` };
  }
  if (Array.isArray(body.problemi) && body.problemi.length > 10) {
    return { error: 'Previše izabranih stavki.' };
  }

  u.usluga = buildUsluga(body);
  return { data: u };
}

function formatUtm(utm) {
  if (!utm || typeof utm !== 'object' || Array.isArray(utm)) return '';
  return Object.entries(utm)
    .slice(0, 10)
    .map(([k, v]) => `${clean(k).slice(0, 40)}=${clean(v).slice(0, 200)}`)
    .filter((s) => s.length > 1)
    .join(', ');
}

/* ───────────────────────── handler ───────────────────────── */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'Neispravan zahtev.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: 'Neispravan zahtev.' });
  }

  // 1) Honeypot: botovi popune skriveno polje — tiho "uspeh", ništa ne radimo
  if (clean(body.website)) {
    return res.status(200).json({ ok: true });
  }

  // 2) Prebrzo slanje (< 3 s od učitavanja forme) — obe vrednosti su sa istog (klijentskog) sata
  const ucitano = Number(body.ucitano);
  const poslato = Number(body.poslato) || Date.now();
  if (!Number.isFinite(ucitano) || ucitano <= 0 || poslato - ucitano < MIN_FILL_MS) {
    return res.status(400).json({ ok: false, error: 'Forma je poslata prebrzo. Pokušajte ponovo.' });
  }

  // 3) Validacija
  const { data: u, error } = validate(body);
  if (error) {
    return res.status(400).json({ ok: false, error });
  }

  const date = new Date();
  const utm = formatUtm(body.utm);

  // 4) Baza pa mejl (mejl dobija ID iz baze ako je upis uspeo). Greške idu samo u Vercel logove.
  let dbOk = false;
  let mailOk = false;
  let id = null;

  try {
    id = await saveToDb(u);
    dbOk = true;
  } catch (err) {
    console.error('[api/contact] Upis u bazu nije uspeo:', err);
  }

  try {
    await sendMail(u, { date, utm, id });
    mailOk = true;
  } catch (err) {
    console.error('[api/contact] Slanje mejla nije uspelo:', err);
  }

  if (!dbOk && !mailOk) {
    // Upit nije sačuvan nigde — korisnik mora da vidi grešku i pozove/piše direktno
    return res.status(500).json({ ok: false, error: 'Slanje trenutno nije uspelo.' });
  }

  return res.status(200).json({ ok: true });
}

