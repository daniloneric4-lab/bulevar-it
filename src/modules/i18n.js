/**
 * i18n.js — Bulevar.IT Bilingual Language Engine (Srpski & English)
 * 
 * Features:
 * - Default: Srpski (SR) — 100% pure Serbian without foreign words
 * - Option: English (EN) — Clean, professional international copy
 * - Persistent language selection via localStorage ('bulevar_lang')
 * - Interactive language switchers for desktop (top-right floating pill)
 *   and mobile (integrated into navbar), plus landing pages
 * - Dispatches 'bulevar:langchange' event so canvas/WebGL scenes update
 */

export const TRANSLATIONS = {
  sr: {
    // Navigation
    'nav.about': 'O nama',
    'nav.services': 'Usluge',
    'nav.journey': 'Put kupca',
    'nav.portfolio': 'Radovi',
    'nav.approach': 'Kako radimo',
    'nav.contact': 'Kontakt',
    'nav.mobileTag': 'Studio za digitalni rast',

    // Hero / O nama
    'hero.badge': '01 · Digitalna agencija',
    'hero.cta': 'Zakažite besplatne konsultacije',
    'hero.explore': 'Istražite sistem',
    'scrollHint': 'SKROLUJ',
    'onama.tag': '02 · O nama',
    'onama.f0.h': 'Studio iz Novog Sada.',
    'onama.f0.p': 'Pravimo digitalne sisteme koji posle ostaju u rukama vlasnika.',
    'onama.f1.h': 'Najmlađi u timu imaju 18 godina.',
    'onama.f1.p': 'Prvi primete kada se internet promeni. Vi to vidite na svom sajtu.',
    'onama.f2.h': 'Godina iskustva mentora u marketingu.',
    'onama.f2.p': 'Znaju šta prodaje i zašto. Paze da sve što napravimo ima poslovni smisao.',
    'onama.f3.h': 'Sistem. I ostaje vaš.',
    'onama.f3.p': 'Ne iznajmljujemo vam sajt. Gradimo ga za vas, i ključevi ostaju kod vas.',

    // Section 03: Ideje & Manifesto
    'ideje.tag': '03 · Za svaku veličinu',
    'ideje.h1a': 'Ideje nemaju',
    'ideje.h1b': 'veličinu firme.',
    'ideje.size': 'Veličina:',
    'ideje.who': 'Ko',
    'ideje.prob': 'Problem',
    'ideje.idea': 'Ideja',
    'manifesto.a': 'Sajt nije trošak.',
    'manifesto.b': 'To je vaš najbolji prodavac koji radi 24/7.',
    'manifesto.l1': 'Rešenje ne biramo po veličini klijenta,',
    'manifesto.l2': 'nego po problemu, potencijalu i saradnji.',

    // Section 04: Usluge
    'usluge.tag': '04 · Usluge',
    'usluge.heading': 'Šta radimo za vaš biznis',
    'usluge.b1.title': 'Digitalna iskustva',
    'usluge.b1.desc': 'Internet sajtovi, prodajne stranice, web i mobilne aplikacije i online prodavnice. Rešava problem nejasne ponude i zbunjenih posetilaca.',
    'usluge.b1.t1': 'Internet sajtovi',
    'usluge.b1.t2': 'Prodajne stranice',
    'usluge.b1.t3': 'Web aplikacije',
    'usluge.b1.t4': 'Dizajn interfejsa',
    'usluge.b2.title': 'Sistemi rasta',
    'usluge.b2.desc': 'Ciljane Google i Meta kampanje, SEO optimizacija, analitika i konverzije. Konstantan priliv pravih i dugoročnih kupaca.',
    'usluge.b2.t1': 'Google oglasi',
    'usluge.b2.t2': 'Meta oglasi',
    'usluge.b2.t3': 'SEO optimizacija',
    'usluge.b2.t4': 'Analitika i povrat',
    'usluge.b3.title': 'Automatizacija & Integracije',
    'usluge.b3.desc': 'AI automatizacija procesa, pametni asistenti, CRM i povezivanje sistema. Štedi vreme timu i sprečava gubljenje upita.',
    'usluge.b3.t1': 'AI asistenti',
    'usluge.b3.t2': 'CRM sistemi',
    'usluge.b3.t3': 'Povezivanje alata',
    'usluge.b3.t4': '24/7 procesi',

    // Section 05: Put kupca (ex "Own your customer journey")
    'oj.primer': 'Primer',
    'oj.stay': 'Smeštaj',
    'oj.food': 'Dostava hrane',
    'oj.tag': 'Preuzmite put kupca',
    'oj.h1': 'Jedan klik menja sve.',
    'oj.ip': 'Od slučajnog linka sa tuđe platforme do vašeg stalnog, direktnog kupca.',
    'oj.stayBrand': 'Kuća pod Fruškom',
    'oj.stayBrandSmall': 'primer · izmišljen smeštaj',
    'oj.foodBrand': 'Picerija Stara peć',
    'oj.foodBrandSmall': 'primer · izmišljena picerija',
    'oj.yourSite': 'vaš sajt',
    'oj.bookDirect': 'Rezerviši direktno',
    'oj.orderDirect': 'Poruči direktno',
    'oj.contTag': 'Put kupca · nastavak',
    'oj.contLeadStay': 'Od jedne rezervacije do celog vikenda.',
    'oj.contLeadFood': 'Od jedne porudžbine do cele večeri.',
    'oj.contSubStay': 'Na platformi gost bira samo noćenje. Na vašem sajtu bira doživljaj: doručak iz sela, degustaciju vina i kasnu odjavu.',
    'oj.contSubFood': 'Na platformi se kupovina uglavnom završava na jelu iz liste. Na vašem sistemu porudžbina može da bude tek početak: gost dodaje ono što ide uz nju, rezerviše sto ili kupi poklon, sve na jednom mestu.',
    'oj.calcTag': 'Koliko košta posrednik',
    'oj.calcHStay': 'Svaka rezervacija preko platforme <em>ima svoj procenat.</em>',
    'oj.calcHFood': 'Svaka porudžbina preko aplikacije <em>ima svoj procenat.</em>',
    'oj.calcLeadStay': 'Booking obično uzima oko 15% po rezervaciji, a Airbnb do 15,5% kod modela gde domaćin plaća celu naknadu. Pomerite klizače i pogledajte koliko je to za vas.',
    'oj.calcLeadFood': 'Wolt i Glovo uzimaju procenat od svake porudžbine. Tačan iznos zavisi od vašeg ugovora, zato ga ovde podesite sami.',
    'oj.calcPrStay': 'Prosečna cena noćenja',
    'oj.calcPrFood': 'Prosečna porudžbina',
    'oj.calcNtStay': 'Noćenja preko platforme godišnje',
    'oj.calcNtFood': 'Porudžbine preko aplikacije godišnje',
    'oj.calcPc': 'Provizija platforme',
    'oj.calcFeeStay': 'Platformi godišnje ode',
    'oj.calcFeeFood': 'Aplikaciji godišnje ode',
    'oj.calcSubStay': 'Uz to platforma zadržava i kontakt gosta, pa sledeći put on opet kreće od pretrage, a ne od vas.',
    'oj.calcSubFood': 'Uz to aplikacija zadržava i kontakt gosta, pa sledeći put on opet bira iz iste liste, a ne kod vas.',
    'oj.calcNoteStay': 'Ovo je okvirni račun. I sopstveni sajt ima troškove: izradu, održavanje, naplatu karticom i oglase. Razlika je u tome što ti troškovi ne rastu sa svakom rezervacijom.',
    'oj.calcNoteFood': 'Ovo je okvirni račun. I sopstveni sistem ima troškove: izradu, održavanje, naplatu karticom i oglase, a dostavu organizujete sami ili preko partnera. Razlika je u tome što ti troškovi ne rastu procentom sa svakom porudžbinom.',
    'oj.vsTagStay': 'Oglas ili iskustvo',
    'oj.vsHStay': 'Na platformi ste oglas. <em>Na sajtu ste mesto.</em>',
    'oj.vsTagFood': 'Kartica ili lokal',
    'oj.vsHFood': 'U aplikaciji ste kartica. <em>Na sajtu ste lokal.</em>',
    'oj.vsColPlatStay': 'Na platformi',
    'oj.vsColPlatFood': 'U aplikaciji',
    'oj.vsColOwn': 'Na vašem sajtu',
    'oj.vsDtLook': 'Izgled',
    'oj.vsDtStory': 'Priča',
    'oj.vsDtFee': 'Provizija',
    'oj.vsDtAfterStay': 'Gost posle boravka',
    'oj.vsDtAfterFood': 'Gost posle porudžbine',
    'oj.vsDdLookPlatStay': 'Isti šablon kao kod svakog drugog oglasa. Gost vas poredi po ceni i zvezdicama.',
    'oj.vsDdLookPlatFood': 'Ista kartica kao kod svakog lokala. Gost vas poredi po ceni i vremenu dostave.',
    'oj.vsDdLookOwnStay': '<strong class="highlight-gold">Vaš dizajn, vaše fotografije, vaš ritam.</strong> Gost oseti mesto pre nego što stigne.',
    'oj.vsDdLookOwnFood': '<strong class="highlight-gold">Vaš dizajn, vaše fotografije, vaša priča.</strong> Gost oseti lokal pre prvog zalogaja.',
    'oj.vsDdStoryPlatStay': 'Lista pogodnosti: Wi-Fi, parking, terasa.',
    'oj.vsDdStoryPlatFood': 'Lista jela sa sličicom.',
    'oj.vsDdStoryOwnStay': 'Kako izgleda jutro, <span class="gold-accent">gde je najbolja vinarija</span>, koja staza vodi do vidikovca.',
    'oj.vsDdStoryOwnFood': 'Po čemu ste poznati, <span class="gold-accent">šta je preporuka kuće</span>, šta je novo ove nedelje.',
    'oj.vsDdFeePlatStay': 'Procenat od svake rezervacije.',
    'oj.vsDdFeePlatFood': 'Procenat od svake porudžbine.',
    'oj.vsDdFeeOwnStay': '<strong class="highlight-gold">Nema procenta po rezervaciji.</strong> Plaćate sajt, a ne svako noćenje.',
    'oj.vsDdFeeOwnFood': '<strong class="highlight-gold">Nema procenta po porudžbini.</strong> Plaćate sistem, a ne svaki obrok.',
    'oj.vsDdAfterPlatStay': 'Ostaje kontakt platforme. Sledeći put kreće od pretrage.',
    'oj.vsDdAfterPlatFood': 'Ostaje kontakt aplikacije. Sledeći put bira iz iste liste.',
    'oj.vsDdAfterOwnStay': '<strong class="highlight-gold">Kontakt ostaje vama:</strong> poruka za sledeću sezonu, popust za povratak, preporuka prijatelju.',
    'oj.vsDdAfterOwnFood': '<strong class="highlight-gold">Kontakt ostaje vama:</strong> novi meni, akcija, poziv za rođendan ili proslavu.',
    'oj.vsFair': 'Ne kažemo da treba da odete sa platformi. One su dobre za prvi susret sa gostom. <strong class="highlight-gold">Sajt je mesto gde taj gost postaje vaš.</strong>',
    'oj.benTag': 'Šta dobro osmišljen sistem može da otvori',

    // Section 06: Portfolio / Radovi
    'port.tag': '06 · Portfolio',
    'port.h': 'Naši radovi',
    'port.cnt': '(02)',
    'port.p': 'Odabrani sistemi, prodajne stranice i web aplikacije koje donose merljive rezultate klijentima.',
    'port.more': 'Pročitaj više',
    'port.close': 'Zatvori',
    'port.visit': 'Poseti sajt ↗',
    'port.problem': 'Problem',
    'port.solution': 'Rešenje',
    'port.whatBuilt': 'Šta smo napravili',
    'port.results': 'Rezultat',

    // Section 07: Kako razmišljamo
    'kr.tag': '07 · Kako razmišljamo',
    'kr.h': 'Bolja pitanja vode do <em>boljih sistema.</em>',
    'kr.sub': 'Ne počinjemo pitanjem „koji sajt želite?“, nego pitanjem šta vaš biznis pokušava da postigne.',
    'kr.end': 'Ne diktiramo šta treba da želite.<br><em>Rešenje gradimo zajedno.</em> Pa opet od 1.',
    'kr.w1': 'Razumemo', 'kr.q1': 'Šta pokušavate da postignete? Ko su vaši kupci?',
    'kr.w2': 'Definišemo', 'kr.q2': 'Gde proces zapinje? Po čemu ćemo znati da radi?',
    'kr.w3': 'Zamišljamo', 'kr.q3': 'Šta bi moglo da reši problem? Šta pretpostavljamo?',
    'kr.w4': 'Dizajniramo', 'kr.q4': 'Šta kupcu olakšava sledeći korak?',
    'kr.w5': 'Gradimo', 'kr.q5': 'Šta mora da se poveže? Šta može jednostavnije?',
    'kr.w6': 'Puštamo', 'kr.q6': 'Šta proveravamo pre puštanja? Ko je zadužen za šta?',
    'kr.w7': 'Učimo', 'kr.q7': 'Šta pokazuju podaci? Šta testiramo sledeće?',

    // Section 08: Sistem iza ekrana
    'sis.tag': '08 · SISTEM IZA EKRANA',
    'sis.h1': 'Najlepši ekran nije uspeh',
    'sis.h2': 'ako sistem iza njega ne radi.',
    'sis.p': 'Gradimo i ekran i sve iza njega, kao jednu celinu koja ostaje vaša.',

    // Section 09: Zašto imate sajt
    'uloga.tag': '09 · Uloga sajta',
    'uloga.h': 'Zašto imate sajt?',
    'uloga.lead': 'Ako je jedini odgovor „da ljudi vide ko smo“, možda od sajta tražimo premalo.',
    'uloga.btn': 'Razgovarajmo o ovom cilju →',
    'uloga.sub': 'Ne treba svakom biznisu sve. Funkcija sajta zavisi od cilja.',
    'uloga.makesSense': 'IMA SMISLA',
    'uloga.r0': 'Vizit karta',
    'uloga.r1': 'Prodaja',
    'uloga.r2': 'Upiti',
    'uloga.r3': 'Zakazivanje',
    'uloga.r4': 'Automatizacija',
    'uloga.r5': 'Sve povezano',

    // Section 10: Kontakt
    'kon.tag': '10 — Kontakt',
    'kon.h1': 'Imate ideju?',
    'kon.h2': 'Ili je sklapamo zajedno.',
    'kon.p': 'Ostavite ime i broj. Javljamo se u roku od 24 sata, a prvi razgovor je besplatan.',
    'kon.name': 'Ime',
    'kon.phName': 'Marko Marković',
    'kon.biz': 'Naziv biznisa',
    'kon.phBiz': 'npr. Mango Event',
    'kon.phone': 'Telefon',
    'kon.phPhone': '66 585 2052',
    'kon.email': 'Email',
    'kon.phEmail': 'ime@firma.rs',
    'kon.qIdea': 'Imate li već neku ideju?',
    'kon.btnHave': 'Imam ideju',
    'kon.btnNone': 'Još nemam',
    'kon.phIdea': 'Šta ste zamislili? Ukratko, npr. sajt za apartmane sa rezervacijama bez provizije…',
    'kon.note': 'Nema problema, za to smo tu. Označite šta vas muči, a ideju sklapamo zajedno.',
    'kon.muke1': 'Nemam sajt',
    'kon.muke2': 'Sajt ne donosi upite',
    'kon.muke3': 'Zavisim od Booking-a / Wolt-a',
    'kon.muke4': 'Previše ručnog posla',
    'kon.muke5': 'Želim više kupaca',
    'kon.qContact': 'Kako da vas kontaktiramo?',
    'kon.call': 'Poziv',
    'kon.msg': 'WhatsApp',
    'kon.submit': 'Pošaljite upit',
    'kon.legal': 'Slanjem pristajete da vas kontaktiramo u vezi sa upitom.',
    'kon.doneH': 'Stiglo je.',
    'kon.doneP': 'Hvala! Javićemo vam se u roku od 24 sata.',
    'kon.sending': 'Šaljem…',
    'kon.error': 'Nešto nije u redu. Pozovite nas na 066 5852 052 ili pišite na bulevarit@gmail.com.',
    'kon.again': 'Pošaljite još jednu',
    'kon.dirPhone': 'TELEFON',

    // Footer
    'footer.tagline': 'DIGITALNI SISTEM KOJI OSTAJE U VAŠIM RUKAMA',
    'footer.rights': '© 2026 Bulevar.IT · Sva prava zadržana. Studio za digitalni rast i izradu sistema.',

    // Landing pages common & specific
    'lp.tagline': 'Studio za digitalni rast · Izrada sajtova i sistema',
    'lp.talk': 'Zakažite razgovor',
    'lp.consult': 'Zakažite besplatne konsultacije',
    'lp.details': 'Pogledajte detalje (Sistem iza ekrana)',
    'lp.step': 'Korak',
    'lp.next': 'Sledeće →',
    'lp.send': 'Pošaljite upit →',
    'lp.close': 'Zatvori',

    // LP1 (sta-ako)
    'lp1.title': 'A ŠTA AKO VAŠ SAJT MOŽE <span class="accent">VIŠE?</span>',
    'lp1.sub': 'Većina sajtova stoji na internetu kao digitalna vizitkarta. Izaberite šta bi vaš sajt mogao da radi za vas dok se vi bavite svojim poslom.',
    'lp1.btnDetails': 'Pogledajte detalje (Sistem iza ekrana)',
    'lp1.bldH': 'A šta ako vaš sajt…',
    'lp1.bldSub': 'Označite, i gledajte kako vizitkarta postaje sistem.',
    'lp1.sumT': 'VAŠ SISTEM · 2 DELA',
    'lp1.lv1': 'VIZITKARTA',
    'lp1.lv2': 'SAJT KOJI RADI',
    'lp1.lv3': 'SISTEM 24/7',
    'lp1.sumBtn': 'Razgovarajmo o ova 2 dela →',
    'lp1.outroH': 'A ŠTA AKO NE MORATE NI DA ZNATE ŠTA JE MOGUĆE?',
    'lp1.outroP': 'Tu počinje naš posao.',
    'lp1.ctaConsult': 'Zakažite konsultacije bez obaveza',
    'lp1.ctaPort': 'Pogledajte u portfoliju',

    // LP2 (zasto-sajt)
    'lp2.title': 'ZAŠTO IMATE <span class="accent">SAJT?</span>',
    'lp2.ansOld': '„Da ljudi vide ko smo.“',
    'lp2.ansNew': 'Da donosi klijente, dok vi radite.',
    'lp2.sub': 'Ako je jedini odgovor „da ljudi vide ko smo“, možda od sajta tražite premalo. Sajt treba da preuzme posao posrednika i donese vam merljive klijente.',
    'lp2.chooseGoal': 'Izaberite cilj sajta ↓',
    'lp2.goalTag': 'ULOGA SAJTA',
    'lp2.goalH': 'Koji je <em>primarni cilj</em> vašeg sajta?',
    'lp2.goalSub': 'Izaberite cilj i pogledajte kako sajt preuzima taj posao.',
    'lp2.vsInstead': 'UMESTO',
    'lp2.vsWith': 'SA VAŠIM SAJTOM',
    'lp2.outroH': 'SAJT JE VAŠ NAJBOLJI RADNIK — AKO ZNA SVOJ CILJ',
    'lp2.outroP': 'Hajde da zajedno definišemo šta vaš sajt treba da postigne.',
    'lp2.talkWithUs': 'Zakažite razgovor sa nama',

    // LP3 (ne-trazimo)
    'lp3.title': 'NE TRAŽIMO DA NAM KAŽETE <span class="accent">KAKAV SAJT ŽELITE.</span>',
    'lp3.sub': 'Počinjemo od pitanja: šta taj sajt treba da uradi za vas? Ne diktiramo rešenje i ne nudimo generičke šablone — rešenje gradimo zajedno kroz 7 jasnih faza.',
    'lp3.see7': 'Pogledajte 7 koraka ↓',
    'lp3.scrollHint': 'SKROLUJTE · SAJT SE GRADI PRED VAMA',
    'lp3.procTag': 'PROCES KOJI DONOSI REZULTATE',
    'lp3.askTag': 'PITAMO',
    'lp3.outroH': 'BOLJA PITANJA VODE DO BOLJIH SISTEMA',
    'lp3.outroP': 'Iskoristite besplatne konsultacije da prođemo kroz vaš projekat.',
    'lp3.talkTeam': 'Zakažite razgovor sa timom',

    // Modal Questionnaire (all 3 LPs)
    'modal.title': 'Zakažite besplatne konsultacije',
    'modal.sub': 'Odgovorite na 2 brza pitanja i ostavite kontakt. Javljamo se u roku od 24h sa konkretnim predlogom.',
    'modal.q1': '1. Šta je primarni cilj vašeg sajta?',
    'modal.g1': 'Automatizacija i sistem',
    'modal.g2': 'Zakazivanje i rezervacije',
    'modal.g3': 'Direktna prodaja',
    'modal.g4': 'Više kvalitetnih upita',
    'modal.g5': 'Brend i poverenje',
    'modal.q2': '2. Koja je vaša delatnost?',
    'modal.b1': 'Usluge / B2B',
    'modal.b2': 'Ugostiteljstvo',
    'modal.b3': 'Smeštaj / Turizam',
    'modal.b4': 'Trgovina / E-commerce',
    'modal.b5': 'Drugo',
    'modal.nameLbl': 'Vaše ime ili naziv firme',
    'modal.namePh': 'npr. Marko Jovanović',
    'modal.phoneLbl': 'Broj telefona ili WhatsApp',
    'modal.phonePh': '+381 6...',
    'modal.emailLbl': 'Email adresa',
    'modal.emailPh': 'vas@email.com',
    'modal.descLbl': 'Kratak opis (opciono)',
    'modal.descPh': 'Trenutni sajt, ideja ili specifičan problem...',
    'modal.submit': 'Pošaljite upit za konsultacije →'
  },

  en: {
    // Navigation
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.journey': 'Journey',
    'nav.portfolio': 'Work',
    'nav.approach': 'Approach',
    'nav.contact': 'Contact',
    'nav.mobileTag': 'Digital Growth Studio',

    // Hero / O nama
    'hero.badge': '01 · Digital Agency',
    'hero.cta': 'Schedule Free Consultation',
    'hero.explore': 'Explore System',
    'scrollHint': 'SCROLL',
    'onama.tag': '02 · About Us',
    'onama.f0.h': 'Studio from Novi Sad.',
    'onama.f0.p': 'We build digital systems that remain entirely in the owners’ hands.',
    'onama.f1.h': 'The youngest on our team are 18.',
    'onama.f1.p': "They're the first to notice when the internet changes. You see it on your website.",
    'onama.f2.h': 'Years of mentor experience in marketing.',
    'onama.f2.p': 'They know what sells and why. Ensuring everything we build makes business sense.',
    'onama.f3.h': 'A system. And it stays yours.',
    'onama.f3.p': 'We never rent you a website. We build it for you, and the keys stay with you.',

    // Section 03: Ideje & Manifesto
    'ideje.tag': '03 · For Every Scale',
    'ideje.h1a': 'Ideas have no',
    'ideje.h1b': 'company size.',
    'ideje.size': 'Scale:',
    'ideje.who': 'Who',
    'ideje.prob': 'Problem',
    'ideje.idea': 'Idea',
    'manifesto.a': 'A website is not an expense.',
    'manifesto.b': 'It is your best salesperson working 24/7.',
    'manifesto.l1': 'We don’t choose solutions by client size,',
    'manifesto.l2': 'but by problem, potential, and collaboration.',

    // Section 04: Usluge
    'usluge.tag': '04 · Services',
    'usluge.heading': 'What we do for your business',
    'usluge.b1.title': 'Digital Experiences',
    'usluge.b1.desc': 'Websites, landing pages, web & mobile applications and e-commerce stores. Resolving unclear offers and visitor confusion.',
    'usluge.b1.t1': 'Websites',
    'usluge.b1.t2': 'Landing Pages',
    'usluge.b1.t3': 'Web Applications',
    'usluge.b1.t4': 'UI/UX Design',
    'usluge.b2.title': 'Growth Systems',
    'usluge.b2.desc': 'Targeted Google and Meta campaigns, SEO optimization, analytics, and conversion. A steady stream of ideal, long-term clients.',
    'usluge.b2.t1': 'Google Ads',
    'usluge.b2.t2': 'Meta Ads',
    'usluge.b2.t3': 'SEO Optimization',
    'usluge.b2.t4': 'Analytics & ROI',
    'usluge.b3.title': 'Automation & Integrations',
    'usluge.b3.desc': 'AI workflow automation, smart assistants, CRM, and system integrations. Saves team time and prevents lost leads.',
    'usluge.b3.t1': 'AI Assistants',
    'usluge.b3.t2': 'CRM Systems',
    'usluge.b3.t3': 'Tool Integration',
    'usluge.b3.t4': '24/7 Workflows',

    // Section 05: Customer journey
    'oj.primer': 'Example',
    'oj.stay': 'Accommodation',
    'oj.food': 'Food Delivery',
    'oj.tag': 'Own your customer journey',
    'oj.h1': 'One click changes everything.',
    'oj.ip': 'From a random third-party platform link into your loyal, direct repeat customer.',
    'oj.stayBrand': 'House under Fruška',
    'oj.stayBrandSmall': 'example · boutique villa',
    'oj.foodBrand': 'Old Oven Pizzeria',
    'oj.foodBrandSmall': 'example · artisan pizzeria',
    'oj.yourSite': 'your website',
    'oj.bookDirect': 'Book directly',
    'oj.orderDirect': 'Order directly',
    'oj.contTag': 'Customer journey · continued',
    'oj.contLeadStay': 'From a single reservation to a whole weekend.',
    'oj.contLeadFood': 'From a single order to a whole evening.',
    'oj.contSubStay': 'On aggregators, a guest only rents a room. On your website, they book the entire experience: artisanal breakfast, wine tasting, and late checkout.',
    'oj.contSubFood': 'On delivery apps, an order ends with a generic dish. On your own system, an order is just the beginning: guests add extras, reserve a table, or purchase a gift card all in one place.',
    'oj.calcTag': 'Middleman Costs',
    'oj.calcHStay': 'Every booking through a platform <em>takes its cut.</em>',
    'oj.calcHFood': 'Every order through delivery apps <em>takes its cut.</em>',
    'oj.calcLeadStay': 'Booking typically takes around 15% per stay, and Airbnb up to 15.5% under host-only fee models. Adjust the sliders and see how much that adds up to.',
    'oj.calcLeadFood': 'Delivery apps take a commission on every single order. The exact cut depends on your contract, so set your numbers here.',
    'oj.calcPrStay': 'Average nightly rate',
    'oj.calcPrFood': 'Average order value',
    'oj.calcNtStay': 'Platform nights per year',
    'oj.calcNtFood': 'App orders per year',
    'oj.calcPc': 'Platform commission',
    'oj.calcFeeStay': 'Paid to platform annually',
    'oj.calcFeeFood': 'Paid to app annually',
    'oj.calcSubStay': 'Moreover, the platform keeps guest contact details, meaning they start from search next time, not with you.',
    'oj.calcSubFood': 'Moreover, the delivery app retains customer data, meaning they pick from an identical list next time, not from you.',
    'oj.calcNoteStay': 'This is an approximate estimate. Your own site has costs too: build, maintenance, card processing, and ads. The key difference is these costs don’t grow with every single booking.',
    'oj.calcNoteFood': 'This is an approximate estimate. Your own system has costs too: build, maintenance, card processing, and ads, while delivery is managed by you or a partner. The key difference is costs don’t grow proportionally with every single order.',
    'oj.vsTagStay': 'Listing or Experience',
    'oj.vsHStay': 'On aggregators you’re a listing. <em>On your website you’re a destination.</em>',
    'oj.vsTagFood': 'Card or Venue',
    'oj.vsHFood': 'In the app you’re a card. <em>On your website you’re the destination.</em>',
    'oj.vsColPlatStay': 'On aggregators',
    'oj.vsColPlatFood': 'On delivery apps',
    'oj.vsColOwn': 'On your website',
    'oj.vsDtLook': 'Visuals',
    'oj.vsDtStory': 'Story',
    'oj.vsDtFee': 'Commission',
    'oj.vsDtAfterStay': 'After the stay',
    'oj.vsDtAfterFood': 'After the order',
    'oj.vsDdLookPlatStay': 'Same generic template as every other listing. Guests compare purely by price and stars.',
    'oj.vsDdLookPlatFood': 'Same uniform card as every restaurant. Diners compare purely by price and delivery speed.',
    'oj.vsDdLookOwnStay': 'Your bespoke design, high-res photography, your brand pace. Guests experience the villa before arriving.',
    'oj.vsDdLookOwnFood': 'Your bespoke design, signature imagery, your culinary story. Guests feel your venue before the first bite.',
    'oj.vsDdStoryPlatStay': 'Checklist of amenities: Wi-Fi, parking, terrace.',
    'oj.vsDdStoryPlatFood': 'Plain dish list with tiny thumbnails.',
    'oj.vsDdStoryOwnStay': 'What morning coffee feels like, top local wineries, trails leading to panoramic viewpoints.',
    'oj.vsDdStoryOwnFood': 'What you’re famous for, house specials, seasonal creations curated this week.',
    'oj.vsDdFeePlatStay': 'A percentage cut from every single reservation.',
    'oj.vsDdFeePlatFood': 'A percentage cut from every single food order.',
    'oj.vsDdFeeOwnStay': 'Zero percentage per booking. You invest in the system, not in renting every night.',
    'oj.vsDdFeeOwnFood': 'Zero percentage per order. You invest in the system, not in taxing every meal.',
    'oj.vsDdAfterPlatStay': 'Platform owns guest data. Next season they start searching all over again.',
    'oj.vsDdAfterPlatFood': 'App retains client contact. Next time they re-order from the generic list.',
    'oj.vsDdAfterOwnStay': 'Client relationships stay yours: seasonal invites, repeat loyalty perks, direct referrals.',
    'oj.vsDdAfterOwnFood': 'Customer loyalty stays yours: seasonal menus, exclusive promotions, catering inquiries.',
    'oj.vsFair': 'We don’t say you should abandon platforms. They are great for introductory discovery. <strong class="highlight-gold">Your website is where that discovery turns into your loyal direct customer.</strong>',
    'oj.benTag': 'What a well-crafted system unlocks for your business',

    // Section 06: Portfolio / Radovi
    'port.tag': '06 · Portfolio',
    'port.h': 'Our Work',
    'port.cnt': '(02)',
    'port.p': 'Selected digital systems, high-converting landing pages, and web apps delivering measurable client revenue.',
    'port.more': 'Read More',
    'port.close': 'Close',
    'port.visit': 'Visit website ↗',
    'port.problem': 'Problem',
    'port.solution': 'Solution',
    'port.whatBuilt': 'What We Built',
    'port.results': 'Results',

    // Section 07: How We Think
    'kr.tag': '07 · How We Think',
    'kr.h': 'Better questions lead to <em>better systems.</em>',
    'kr.sub': 'We don’t start with “what website do you want?”, but with what your business is striving to achieve.',
    'kr.end': 'We don’t dictate what you should want.<br><em>We build the solution together.</em> Then back to 1.',
    'kr.w1': 'Understand', 'kr.q1': 'What are you aiming to achieve? Who are your customers?',
    'kr.w2': 'Define', 'kr.q2': 'Where is the process stalling? How will we measure success?',
    'kr.w3': 'Envision', 'kr.q3': 'What could resolve the core problem? What assumptions do we make?',
    'kr.w4': 'Design', 'kr.q4': 'What makes the next step easiest for the customer?',
    'kr.w5': 'Build', 'kr.q5': 'What integrations are vital? What can be simplified?',
    'kr.w6': 'Launch', 'kr.q6': 'What do we verify pre-launch? Who owns each responsibility?',
    'kr.w7': 'Learn', 'kr.q7': 'What do the metrics show? What experiment is next?',

    // Section 08: Sistem iza ekrana
    'sis.tag': '08 · SYSTEM BEHIND THE SCREEN',
    'sis.h1': 'The prettiest screen is not success',
    'sis.h2': 'if the system behind it doesn’t work.',
    'sis.p': 'We engineer both the interface and everything behind it as one unified asset that remains 100% yours.',

    // Section 09: Zašto imate sajt
    'uloga.tag': '09 · WEBSITE ROLE',
    'uloga.h': 'Why do you have a website?',
    'uloga.lead': 'If the only answer is “so people see who we are”, we might be asking too little from our web presence.',
    'uloga.btn': 'Let’s discuss this objective →',
    'uloga.sub': 'Not every business needs everything. The website’s purpose depends on your core goal.',
    'uloga.makesSense': 'MAKES SENSE',
    'uloga.r0': 'Business card',
    'uloga.r1': 'Direct sales',
    'uloga.r2': 'Lead generation',
    'uloga.r3': 'Bookings',
    'uloga.r4': 'Automation',
    'uloga.r5': 'Full ecosystem',

    // Section 10: Kontakt
    'kon.tag': '10 — Contact',
    'kon.h1': 'Have an idea?',
    'kon.h2': 'Or let’s build it together.',
    'kon.p': 'Leave your name and number. We get back to you within 24 hours, and the first consultation is free.',
    'kon.name': 'Name',
    'kon.phName': 'John Doe',
    'kon.biz': 'Business name',
    'kon.phBiz': 'e.g. Mango Event',
    'kon.phone': 'Phone',
    'kon.phPhone': '66 585 2052',
    'kon.email': 'Email',
    'kon.phEmail': 'name@company.com',
    'kon.qIdea': 'Do you already have a project idea?',
    'kon.btnHave': 'I have an idea',
    'kon.btnNone': 'Not yet',
    'kon.phIdea': 'What did you envision? Briefly, e.g. booking website for boutique villas with zero commissions…',
    'kon.note': 'No worries, that’s what we are here for. Pick what troubles you, and we’ll shape the idea together.',
    'kon.muke1': 'I have no website',
    'kon.muke2': 'Website brings no leads',
    'kon.muke3': 'Dependent on Booking / Wolt',
    'kon.muke4': 'Too much manual paperwork',
    'kon.muke5': 'I need more customers',
    'kon.qContact': 'How should we contact you?',
    'kon.call': 'Phone call',
    'kon.msg': 'WhatsApp',
    'kon.submit': 'Send Inquiry',
    'kon.legal': 'By submitting, you agree to be contacted regarding your inquiry.',
    'kon.doneH': 'Message received.',
    'kon.doneP': 'Thank you! We’ll get back to you within 24 hours.',
    'kon.sending': 'Sending…',
    'kon.error': 'Something went wrong. Call us at +381 66 5852 052 or email bulevarit@gmail.com.',
    'kon.again': 'Send another message',
    'kon.dirPhone': 'PHONE NUMBER',

    // Footer
    'footer.tagline': 'DIGITAL SYSTEM THAT REMAINS IN YOUR HANDS',
    'footer.rights': '© 2026 Bulevar.IT · All rights reserved. Digital growth and systems studio.',

    // Landing pages common & specific
    'lp.tagline': 'Digital Growth Studio · Websites & Systems',
    'lp.talk': 'Book a Call',
    'lp.consult': 'Book Free Consultation',
    'lp.details': 'See Details (System behind screen)',
    'lp.step': 'Step',
    'lp.next': 'Next →',
    'lp.send': 'Submit Inquiry →',
    'lp.close': 'Close',

    // LP1 (sta-ako)
    'lp1.title': 'WHAT IF YOUR WEBSITE COULD DO <span class="accent">MORE?</span>',
    'lp1.sub': 'Most websites sit online like digital business cards. Choose what your website could do for you while you run your core business.',
    'lp1.btnDetails': 'See Details (System behind screen)',
    'lp1.bldH': 'What if your website…',
    'lp1.bldSub': 'Check options, and watch a digital card transform into a complete system.',
    'lp1.sumT': 'YOUR SYSTEM · 2 MODULES',
    'lp1.lv1': 'BUSINESS CARD',
    'lp1.lv2': 'WORKING WEBSITE',
    'lp1.lv3': '24/7 SYSTEM',
    'lp1.sumBtn': 'Let’s discuss these 2 modules →',
    'lp1.outroH': 'WHAT IF YOU DON’T EVEN NEED TO KNOW WHAT’S POSSIBLE?',
    'lp1.outroP': 'That is where our work begins.',
    'lp1.ctaConsult': 'Book free consultation',
    'lp1.ctaPort': 'View in portfolio',

    // LP2 (zasto-sajt)
    'lp2.title': 'WHY DO YOU HAVE A <span class="accent">WEBSITE?</span>',
    'lp2.ansOld': '“So people see who we are.”',
    'lp2.ansNew': 'To generate clients while you work.',
    'lp2.sub': 'If the only answer is “so people see who we are”, you might be asking too little. A website should bypass aggregators and deliver measurable clients.',
    'lp2.chooseGoal': 'Choose website objective ↓',
    'lp2.goalTag': 'WEBSITE ROLE',
    'lp2.goalH': 'What is the <em>primary objective</em> of your website?',
    'lp2.goalSub': 'Select an objective and watch the website execute that job.',
    'lp2.vsInstead': 'INSTEAD OF',
    'lp2.vsWith': 'WITH YOUR WEBSITE',
    'lp2.outroH': 'A WEBSITE IS YOUR BEST EMPLOYEE — IF IT KNOWS ITS GOAL',
    'lp2.outroP': 'Let’s define together what your website strives to achieve.',
    'lp2.talkWithUs': 'Book a call with us',

    // LP3 (ne-trazimo)
    'lp3.title': 'WE DON’T ASK YOU TO TELL US <span class="accent">WHAT WEBSITE YOU WANT.</span>',
    'lp3.sub': 'We begin with the question: what should that website accomplish for you? We don’t dictate solutions or offer generic templates — we build solutions together through 7 clear stages.',
    'lp3.see7': 'Explore the 7 steps ↓',
    'lp3.scrollHint': 'SCROLL · THE WEBSITE BUILDS BEFORE YOU',
    'lp3.procTag': 'A PROCESS THAT DELIVERS RESULTS',
    'lp3.askTag': 'WE ASK',
    'lp3.outroH': 'BETTER QUESTIONS LEAD TO BETTER SYSTEMS',
    'lp3.outroP': 'Take advantage of a free consultation to review your project.',
    'lp3.talkTeam': 'Schedule a conversation with our team',

    // Modal Questionnaire (all 3 LPs)
    'modal.title': 'Schedule Free Consultation',
    'modal.sub': 'Answer 2 quick questions and leave contact details. We respond within 24h with a concrete proposal.',
    'modal.q1': '1. What is the primary goal of your website?',
    'modal.g1': 'Automation & systems',
    'modal.g2': 'Appointments & bookings',
    'modal.g3': 'Direct sales',
    'modal.g4': 'More qualified leads',
    'modal.g5': 'Brand & authority',
    'modal.q2': '2. What is your industry?',
    'modal.b1': 'Services / B2B',
    'modal.b2': 'Hospitality',
    'modal.b3': 'Accommodation / Tourism',
    'modal.b4': 'Retail / E-commerce',
    'modal.b5': 'Other',
    'modal.nameLbl': 'Your name or company name',
    'modal.namePh': 'e.g. John Doe',
    'modal.phoneLbl': 'Phone number or WhatsApp',
    'modal.phonePh': '+381 6...',
    'modal.emailLbl': 'Email address',
    'modal.emailPh': 'your@email.com',
    'modal.descLbl': 'Short description (optional)',
    'modal.descPh': 'Current site, idea, or specific challenge...',
    'modal.submit': 'Submit Inquiry for Consultation →'
  }
};

let currentLang = 'sr';

export function getLang() {
  return currentLang;
}

export function t(key, fallback = '') {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.sr;
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.sr[key] || fallback || key);
}

export function setLang(lang) {
  if (lang !== 'sr' && lang !== 'en') lang = 'sr';
  currentLang = lang;
  try {
    localStorage.setItem('bulevar_lang', lang);
  } catch (e) {}

  document.documentElement.lang = lang === 'sr' ? 'sr-RS' : 'en-US';

  // Update all DOM elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated) {
      // If element has data-dec (decode text), update it too
      if (el.hasAttribute('data-dec')) {
        el.setAttribute('data-dec', translated);
      }
      // If element has data-t (decode text for contact heading), update it too
      if (el.hasAttribute('data-t')) {
        el.setAttribute('data-t', translated);
      }
      if (translated.includes('<')) {
        el.innerHTML = translated;
      } else {
        el.textContent = translated;
      }
    }
  });

  // Update placeholder attributes
  const placeholderEls = document.querySelectorAll('[data-i18n-ph]');
  placeholderEls.forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    const translated = t(key);
    if (translated) {
      el.setAttribute('placeholder', translated);
    }
  });

  // Update switcher buttons UI state
  const switchers = document.querySelectorAll('.lang-switcher');
  switchers.forEach((sw) => {
    const btns = sw.querySelectorAll('.lang-btn');
    btns.forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang');
      const isActive = btnLang === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  });

  // Dispatch custom event for 3D/canvas modules
  window.dispatchEvent(new CustomEvent('bulevar:langchange', { detail: { lang } }));
}

/**
 * Creates and injects the language switcher elements
 * @param {'main' | 'lp'} context
 */
export function initI18n(context = 'main') {
  // Read saved preference, default to 'sr'
  let savedLang = 'sr';
  try {
    savedLang = localStorage.getItem('bulevar_lang') || 'sr';
  } catch (e) {}
  if (savedLang !== 'sr' && savedLang !== 'en') savedLang = 'sr';

  // Inject switcher into page if not already present
  if (context === 'main') {
    setupMainSiteSwitchers();
  } else {
    setupLpSwitchers();
  }

  // Set initial language
  setLang(savedLang);
}

function createSwitcherHTML(idSuffix = '') {
  return `
    <div class="lang-switcher" id="lang-switcher${idSuffix}" role="group" aria-label="Izbor jezika / Language selector">
      <button type="button" class="lang-btn" data-lang="sr" aria-label="Srpski jezik">SR</button>
      <span class="lang-sep" aria-hidden="true">|</span>
      <button type="button" class="lang-btn" data-lang="en" aria-label="English language">EN</button>
    </div>
  `;
}

function setupMainSiteSwitchers() {
  // 1. Desktop: Floating in top-right corner
  if (!document.getElementById('lang-switcher-desktop')) {
    const desktopContainer = document.createElement('div');
    const mainNav = document.getElementById('main-nav');
    desktopContainer.className = 'lang-desktop-wrap' + (mainNav && mainNav.classList.contains('nav--visible') ? ' lang--visible' : '');
    desktopContainer.innerHTML = createSwitcherHTML('-desktop');
    document.body.appendChild(desktopContainer);
  }

  // 2. Mobile: Inside navbar bar (.nav__inner)
  const navInner = document.querySelector('.nav__inner');
  const navToggle = document.getElementById('nav-toggle');
  if (navInner && !document.getElementById('lang-switcher-mobile')) {
    const mobContainer = document.createElement('div');
    mobContainer.className = 'lang-mobile-wrap';
    mobContainer.innerHTML = createSwitcherHTML('-mobile');
    if (navToggle) {
      navInner.insertBefore(mobContainer, navToggle);
    } else {
      navInner.appendChild(mobContainer);
    }
  }

  // Bind click handlers to all .lang-btn
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) setLang(targetLang);
    });
  });
}

function setupLpSwitchers() {
  const headerActions = document.querySelector('.lp-header-actions');
  if (headerActions && !document.getElementById('lang-switcher-lp')) {
    const lpContainer = document.createElement('div');
    lpContainer.className = 'lang-lp-wrap';
    lpContainer.innerHTML = createSwitcherHTML('-lp');
    headerActions.insertBefore(lpContainer, headerActions.firstChild);
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) setLang(targetLang);
    });
  });
}
