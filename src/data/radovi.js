/**
 * radovi.js — Portfolio Projects Case Study Data (Mango Event & Ti si ovde)
 * Bilingual support: Serbian (default) & English
 */

export const RADOVI_DATA = {
  sr: [
    {
      id: 'mango',
      tag: 'Sistem za događaje',
      title: 'Mango Event',
      url: 'https://mangoevent.rs/',
      small: {
        problem: 'Organizatori su prijave, uplate i spiskove gostiju vodili ručno, kroz poruke i tabele, pa su se podaci gubili.',
        solution: 'Jedan sistem za događaje: online prijava, automatska potvrda i pregled svih gostiju na jednom mestu.'
      },
      modal: {
        tag: 'Sistem za događaje',
        title: 'Mango Event',
        lead: 'Sistem za prodaju karata i organizaciju događaja koji automatizuje ceo proces od prve prijave do ulaska na vrata.',
        problem: 'Prijave, uplate i spiskove gostiju vodili su se ručno, kroz poruke, pozive i tabele. Svaki događaj je značio dane administracije, a greške u spiskovima su se primećivale tek na ulazu.',
        solution: 'Napravili smo sistem u kome se gost prijavi online, odmah dobije potvrdu, a organizator u svakom trenutku vidi ko dolazi, ko je platio i koliko mesta je ostalo.',
        whatBuilt: [
          'Stranica događaja sa online prijavom',
          'Automatske potvrde i podsetnici',
          'Pregled gostiju i uplata za organizatora',
          'Izvoz spiskova za ulaz'
        ],
        results: [
          ['−70%', 'vremena na administraciju'],
          ['24/7', 'prijave bez poziva'],
          ['1', 'mesto za sve podatke']
        ],
        visitText: 'Poseti sajt ↗'
      }
    },
    {
      id: 'tisiovde',
      tag: 'Digitalni sistem',
      title: 'Ti si ovde',
      url: 'https://tisiovde.com/',
      small: {
        problem: 'Lokalna mesta nisu imala jednostavan način da ih ljudi pronađu i vide šta nude, baš kada su u blizini.',
        solution: 'Digitalni sistem koji povezuje lokacije, ponudu i korisnike, sa mapom i profilima koje vlasnici sami uređuju.'
      },
      modal: {
        tag: 'Digitalni sistem',
        title: 'Ti si ovde',
        lead: 'Platforma koja mapira ponudu u okolini korisnika i omogućava lokalnim biznisima da budu vidljivi bez skupog marketinga.',
        problem: 'Ljudi u prolazu nisu imali brz način da vide šta se nalazi oko njih, a mala lokalna mesta nisu imala gde da se jednostavno predstave.',
        solution: 'Sistem sa mapom i profilima lokacija. Vlasnici sami uređuju ponudu, a korisnik na jednom ekranu vidi šta je u blizini i kako da stigne.',
        whatBuilt: [
          'Mapa sa lokacijama u blizini',
          'Profili mesta koje vlasnici sami uređuju',
          'Pretraga i filteri po kategorijama',
          'Prilagođeno telefonu'
        ],
        results: [
          ['+120', 'lokacija u sistemu'],
          ['3 s', 'do prvog rezultata'],
          ['100%', 'na telefonu']
        ],
        visitText: 'Poseti sajt ↗'
      }
    }
  ],

  en: [
    {
      id: 'mango',
      tag: 'Event System',
      title: 'Mango Event',
      url: 'https://mangoevent.rs/',
      small: {
        problem: 'Organizers managed registrations, payments, and guest lists manually via chat messages and spreadsheets, leading to data errors.',
        solution: 'A unified event system: online registration, instant automated confirmation, and full guest overview in one place.'
      },
      modal: {
        tag: 'Event System',
        title: 'Mango Event',
        lead: 'A ticket-sales and event management system automating the full lifecycle from first registration to door check-in.',
        problem: 'Registrations, invoices, and attendee lists were handled manually through calls and scattered sheets. Every event cost days of admin overhead, with guest errors discovered only at the door.',
        solution: 'We engineered a system where guests register online and get instant passes, while the organizer tracks live payments, attendees, and remaining seats anytime.',
        whatBuilt: [
          'High-converting event pages with online registration',
          'Automated email/SMS confirmations & reminders',
          'Real-time organizer portal with payments & live check-in',
          'One-click guest list export for gate scanners'
        ],
        results: [
          ['−70%', 'admin time spent'],
          ['24/7', 'hands-free bookings'],
          ['1', 'single source of truth']
        ],
        visitText: 'Visit website ↗'
      }
    },
    {
      id: 'tisiovde',
      tag: 'Digital Platform',
      title: 'Ti si ovde',
      url: 'https://tisiovde.com/',
      small: {
        problem: 'Local shops and venues had no straightforward way for nearby pedestrians to discover them and explore live offerings.',
        solution: 'A digital ecosystem connecting venues and users through an interactive proximity map and self-managed profiles.'
      },
      modal: {
        tag: 'Digital Platform',
        title: 'Ti si ovde',
        lead: 'A local discovery platform mapping venues in the user’s immediate surroundings, enabling neighborhood businesses to gain visibility.',
        problem: 'Passersby lacked an immediate tool to see what artisan spots were around them, and small local businesses could not afford high-cost ad campaigns.',
        solution: 'A fast geolocation map and venue portal. Owners customize menus and hours, while customers see nearby venues and directions on a single screen.',
        whatBuilt: [
          'Interactive map with real-time location radius',
          'Self-managed owner venue profiles and menus',
          'Category filters & lightning-fast search',
          'Optimized for mobile-first touch navigation'
        ],
        results: [
          ['+120', 'live venues onboarded'],
          ['3 s', 'to first nearby discovery'],
          ['100%', 'optimized for mobile']
        ],
        visitText: 'Visit website ↗'
      }
    }
  ]
};
