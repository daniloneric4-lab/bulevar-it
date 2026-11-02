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
        problem: 'Prijave izlagača stizale su putem poruka, mejla i telefona, a svaku je trebalo ručno obraditi i uneti u ugovor. To je oduzimalo mnogo vremena, stvaralo veliki administrativni teret i povećavalo rizik da se potencijalni izlagači izgube zbog sporog i komplikovanog procesa prijave.',
        solution: 'Sajt za online prijave, administracija za vlasnicu i automatizacije koje same obrađuju prijave i pripremaju ugovore.'
      },
      modal: {
        tag: 'Sistem za događaje',
        title: 'Mango Event',
        lead: 'Sistem za prijave na bazare, od prijave izlagača do ugovora spremnog za potpis.',
        problem: 'Prijave izlagača stizale su putem poruka, mejla i telefona, a svaku je trebalo ručno obraditi i uneti u ugovor. To je oduzimalo mnogo vremena, stvaralo veliki administrativni teret i povećavalo rizik da se potencijalni izlagači izgube zbog sporog i komplikovanog procesa prijave.',
        solution: 'Sajt za online prijave, administracija za vlasnicu i automatizacije koje same obrađuju prijave i pripremaju ugovore.',
        whatBuilt: [
          'Sajt sa online prijavom',
          'Administraciju za vlasnicu',
          'Automatsko prihvatanje i odbijanje prijava',
          'Automatsko popunjavanje ugovora'
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
        problem: 'Ti Si Ovde je prostor sa atmosferom, a klasičan sajt i papirne kartice za pečate to nisu mogli da prenesu. Gost bi popio kafu i otišao, bez veze sa mestom.',
        solution: 'Unikatan sajt u duhu prostora, loyalty web aplikacija koja nagrađuje goste koji se vraćaju i softver koji poruke gostiju pretvara u deo lokala.'
      },
      modal: {
        tag: 'Digitalni sistem',
        title: 'Ti si ovde',
        lead: 'Sistem za koncept kafe bar koji gosta čini delom prostora.',
        problem: 'Ti Si Ovde je prostor sa atmosferom, a klasičan sajt i papirne kartice za pečate to nisu mogli da prenesu. Gost bi popio kafu i otišao, bez veze sa mestom.',
        solution: 'Unikatan sajt u duhu prostora, loyalty web aplikacija koja nagrađuje goste koji se vraćaju i softver koji poruke gostiju pretvara u deo lokala.',
        whatBuilt: [
          'Unikatan sajt',
          'Loyalty web aplikaciju',
          'Softver za stikere i poruke gostiju'
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
        problem: 'Exhibitor applications arrived via messages, email, and phone calls, each needing manual processing and entering into contracts. This took up excessive time, created a heavy administrative burden, and increased the risk of losing potential exhibitors due to a slow and complicated registration process.',
        solution: 'A website for online applications, admin panel for the owner, and automations that process applications and prepare contracts automatically.'
      },
      modal: {
        tag: 'Event System',
        title: 'Mango Event',
        lead: 'System for bazaar applications, from exhibitor registration to ready-to-sign contracts.',
        problem: 'Exhibitor applications arrived via messages, email, and phone calls, each needing manual processing and entering into contracts. This took up excessive time, created a heavy administrative burden, and increased the risk of losing potential exhibitors due to a slow and complicated registration process.',
        solution: 'A website for online applications, admin panel for the owner, and automations that process applications and prepare contracts automatically.',
        whatBuilt: [
          'Website with online registration',
          'Admin panel for the owner',
          'Automated application approval & rejection',
          'Automated contract generation'
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
        problem: 'Ti Si Ovde is a space rich in atmosphere, which standard websites and paper stamp cards failed to convey. Guests would drink coffee and leave without connecting to the venue.',
        solution: 'A bespoke website embodying the space’s soul, a loyalty web app rewarding returning guests, and software that turns guest messages into part of the interior.'
      },
      modal: {
        tag: 'Digital Platform',
        title: 'Ti si ovde',
        lead: 'System for a concept coffee bar that makes guests part of the space.',
        problem: 'Ti Si Ovde is a space rich in atmosphere, which standard websites and paper stamp cards failed to convey. Guests would drink coffee and leave without connecting to the venue.',
        solution: 'A bespoke website embodying the space’s soul, a loyalty web app rewarding returning guests, and software that turns guest messages into part of the interior.',
        whatBuilt: [
          'Bespoke custom website',
          'Loyalty web application',
          'Guest stickers & messaging software'
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
