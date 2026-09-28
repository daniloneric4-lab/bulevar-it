import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ═══════════════════════════════════════════════════════════════════════
 * PARAMETRI ZA PODEŠAVANJE ANIMACIJE (Lako prilagođavanje u hodu)
 * ═══════════════════════════════════════════════════════════════════════
 */
export const ABOUT_PARALLAX_CONFIG = {
  // Dužina scroll-lock (pin) faze u odnosu na visinu ekrana (npr. '+=250%')
  scrollLength: '+=250%',

  // Glatkoća scrub animacije u sekundama (1 = standardni GSAP scrub)
  scrub: 1,

  // Sloj 1: Gornja osnova (pokriva redove 1-4, 100% širine)
  layer1: {
    yPercent: -105,     // Izlazak nagore van ekrana
    scale: 1.08,        // Blagi zoom-out/ekspanzija
    counterY: 14,       // Kontra-parallax unutrašnje slike nagore/nadole
    counterScale: 1.04, // Kontra-zoom unutrašnje slike
    duration: 0.92,
  },

  // Sloj 2: Srednji levi prozor (pokriva redove 4-5, 0-44.15% širine)
  layer2: {
    xPercent: -120,     // Izlazak ulevo van ekrana
    counterX: 18,       // Kontra-parallax unutrašnje slike udesno
    duration: 0.88,
  },

  // Sloj 3: Donji levi blok (pokriva redove 5-6, 0-60% širine)
  layer3: {
    yPercent: 120,      // Izlazak nadole van ekrana
    xPercent: -30,      // Blagi pomeraj ulevo
    counterY: -16,      // Kontra-parallax nagore
    counterX: 12,       // Kontra-parallax udesno
    duration: 0.95,
  },

  // Sloj 4: Donji desni blok (pokriva redove 5-6, 44.15%-100% širine)
  layer4: {
    xPercent: 120,      // Izlazak udesno van ekrana
    counterX: -18,      // Kontra-parallax ulevo
    duration: 0.88,
  },

  // Pragovi aktiviranja tokom skrola (0.0 = početak pina, 1.0 = kraj pina)
  textRevealThreshold: 0.20,   // Tekst počinje da se ispisuje na 20% skrola
  cardsRevealThreshold: 0.50,  // Info kartice se pojavljuju na 50% skrola
  layersFadeThreshold: 0.85,   // Slike potpuno nestaju i gase se od 85% do 100%
};

interface ValueCardItem {
  icon: string;
  title: string;
  text: string;
}

const VALUES: ValueCardItem[] = [
  { icon: '⚡', title: 'Brzina', text: 'Poštujemo rokove. Uvek.' },
  { icon: '◆', title: 'Kvalitet', text: 'Svaki detalj prolazi kroz naše oči pre nego što prođe kroz vaše.' },
  { icon: '📊', title: 'Rezultati', text: 'Merimo uspeh brojevima, ne lepim rečima.' },
  { icon: '🤝', title: 'Podrška', text: 'Tu smo i kad je sajt gotov — ne samo dok traje projekat.' },
];

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const parallaxWrapRef = useRef<HTMLDivElement | null>(null);
  const topFadeRef = useRef<HTMLDivElement | null>(null);

  // Reference za slojeve (kontejneri za x/y pomake)
  const layer1Ref = useRef<HTMLDivElement | null>(null);
  const layer2Ref = useRef<HTMLDivElement | null>(null);
  const layer3Ref = useRef<HTMLDivElement | null>(null);
  const layer4Ref = useRef<HTMLDivElement | null>(null);

  // Reference za unutrašnje slike (kontra-parallax)
  const img1Ref = useRef<HTMLImageElement | null>(null);
  const img2Ref = useRef<HTMLImageElement | null>(null);
  const img3Ref = useRef<HTMLImageElement | null>(null);
  const img4Ref = useRef<HTMLImageElement | null>(null);

  // Reference za tekst i kartice
  const labelRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Kreiraj GSAP Context radi automatskog čišćenja memorije pri unmount-u
    const ctx = gsap.context(() => {
      // 1. Priprema i split-ovanje naslova (reč po reč sa overflow-hidden wrapperom)
      const headingEl = headingRef.current;
      if (headingEl && !headingEl.dataset.split) {
        headingEl.dataset.split = 'true';
        const rawText = headingEl.innerHTML;
        // Podrži akcentovane spanove i običan tekst
        headingEl.innerHTML = rawText
          .split(' ')
          .map((word) => `<span class="inline-block overflow-hidden align-bottom pb-1"><span class="about-word inline-block translate-y-[115%] opacity-0 will-change-transform">${word}</span></span>`)
          .join(' ');
      }

      // 2. Priprema i split-ovanje opisa (typewriter / stream fade efekat)
      const descEl = descRef.current;
      if (descEl && !descEl.dataset.split) {
        descEl.dataset.split = 'true';
        const words = descEl.textContent?.trim().split(/\s+/) || [];
        descEl.innerHTML = words
          .map((word) => `<span class="about-desc-word inline-block opacity-0 translate-y-3 blur-[4px] will-change-transform">${word}</span>`)
          .join(' ');
      }

      const headingWords = section.querySelectorAll('.about-word');
      const descWords = section.querySelectorAll('.about-desc-word');
      const cards = cardsRef.current ? cardsRef.current.children : [];

      // Početno skrivanje elemenata iza slika
      if (labelRef.current) gsap.set(labelRef.current, { opacity: 0, x: -25 });
      if (headingWords.length) gsap.set(headingWords, { y: '115%', opacity: 0 });
      if (descWords.length) gsap.set(descWords, { opacity: 0, y: 12, filter: 'blur(4px)' });
      if (cards.length) gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });

      // 3. Forward-Only Timeline za ispisivanje teksta (ne reversuje pri skrolu unazad)
      const textTl = gsap.timeline({ paused: true });

      if (labelRef.current) {
        textTl.to(labelRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0);
      }

      if (headingWords.length) {
        textTl.to(headingWords, {
          y: '0%',
          opacity: 1,
          stagger: 0.05,
          duration: 0.65,
          ease: 'power3.out',
        }, 0.1);
      }

      if (descWords.length) {
        textTl.to(descWords, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.012,
          duration: 0.45,
          ease: 'power2.out',
        }, 0.35);
      }

      // 4. Forward-Only Timeline za info kartice (ne reversuje pri skrolu unazad)
      const cardsTl = gsap.timeline({ paused: true });
      if (cards.length) {
        cardsTl.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power2.out',
        });
      }

      // 5. Timeline za razdvajanje 4 slike vezan za scrub
      const imagesTl = gsap.timeline({ paused: true });

      // Sloj 1 (Gornja osnova)
      if (layer1Ref.current) {
        imagesTl.to(layer1Ref.current, {
          yPercent: ABOUT_PARALLAX_CONFIG.layer1.yPercent,
          scale: ABOUT_PARALLAX_CONFIG.layer1.scale,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer1.duration,
        }, 0);
      }
      if (img1Ref.current) {
        imagesTl.to(img1Ref.current, {
          yPercent: ABOUT_PARALLAX_CONFIG.layer1.counterY,
          scale: ABOUT_PARALLAX_CONFIG.layer1.counterScale,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer1.duration,
        }, 0);
      }

      // Sloj 2 (Srednji levi prozor)
      if (layer2Ref.current) {
        imagesTl.to(layer2Ref.current, {
          xPercent: ABOUT_PARALLAX_CONFIG.layer2.xPercent,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer2.duration,
        }, 0);
      }
      if (img2Ref.current) {
        imagesTl.to(img2Ref.current, {
          xPercent: ABOUT_PARALLAX_CONFIG.layer2.counterX,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer2.duration,
        }, 0);
      }

      // Sloj 3 (Donji levi blok)
      if (layer3Ref.current) {
        imagesTl.to(layer3Ref.current, {
          yPercent: ABOUT_PARALLAX_CONFIG.layer3.yPercent,
          xPercent: ABOUT_PARALLAX_CONFIG.layer3.xPercent,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer3.duration,
        }, 0);
      }
      if (img3Ref.current) {
        imagesTl.to(img3Ref.current, {
          yPercent: ABOUT_PARALLAX_CONFIG.layer3.counterY,
          xPercent: ABOUT_PARALLAX_CONFIG.layer3.counterX,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer3.duration,
        }, 0);
      }

      // Sloj 4 (Donji desni blok)
      if (layer4Ref.current) {
        imagesTl.to(layer4Ref.current, {
          xPercent: ABOUT_PARALLAX_CONFIG.layer4.xPercent,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer4.duration,
        }, 0);
      }
      if (img4Ref.current) {
        imagesTl.to(img4Ref.current, {
          xPercent: ABOUT_PARALLAX_CONFIG.layer4.counterX,
          ease: 'power1.inOut',
          duration: ABOUT_PARALLAX_CONFIG.layer4.duration,
        }, 0);
      }

      // Prelaz gornje ivice bledi na početku razdvajanja
      if (topFadeRef.current) {
        imagesTl.to(topFadeRef.current, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 0);
      }

      // Potpuni fade-out slika na kraju sekvence (85%-100%)
      if (parallaxWrapRef.current) {
        imagesTl.fromTo(
          parallaxWrapRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            ease: 'power1.out',
            duration: 1 - ABOUT_PARALLAX_CONFIG.layersFadeThreshold,
          },
          ABOUT_PARALLAX_CONFIG.layersFadeThreshold
        );
      }

      let hasTextPlayed = false;
      let hasCardsPlayed = false;

      // 6. Master ScrollTrigger sa PIN i SCRUB podrškom
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: ABOUT_PARALLAX_CONFIG.scrollLength,
        pin: true,
        pinSpacing: true,
        scrub: ABOUT_PARALLAX_CONFIG.scrub,
        animation: imagesTl,
        onUpdate: (self) => {
          const progress = self.progress;

          // Pokreni ispisivanje teksta čim se slike malo razmaknu (~20%)
          if (progress >= ABOUT_PARALLAX_CONFIG.textRevealThreshold && !hasTextPlayed) {
            textTl.play();
            hasTextPlayed = true;
          }

          // Pokreni prikaz kartica nakon teksta (~50%)
          if (progress >= ABOUT_PARALLAX_CONFIG.cardsRevealThreshold && !hasCardsPlayed) {
            cardsTl.play();
            hasCardsPlayed = true;
          }
        },
        onLeave: () => {
          // Osiguraj vidljivost teksta ako korisnik brzo preskroluje
          if (!hasTextPlayed) {
            textTl.progress(1);
            hasTextPlayed = true;
          }
          if (!hasCardsPlayed) {
            cardsTl.progress(1);
            hasCardsPlayed = true;
          }
        },
        onLeaveBack: () => {
          // Resetuj isključivo pri potpunom napuštanju sekcije nagore (povratak na Hero)
          hasTextPlayed = false;
          hasCardsPlayed = false;
          textTl.pause(0);
          cardsTl.pause(0);
          if (labelRef.current) gsap.set(labelRef.current, { opacity: 0, x: -25 });
          if (headingWords.length) gsap.set(headingWords, { y: '115%', opacity: 0 });
          if (descWords.length) gsap.set(descWords, { opacity: 0, y: 12, filter: 'blur(4px)' });
          if (cards.length) gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="o-nama"
      ref={sectionRef}
      className="relative w-full h-screen min-h-screen overflow-hidden bg-[#172032] flex items-center justify-center text-[#F5F0E6]"
    >
      {/* 1. SADRŽAJ U POZADINI (z-index: 10, Navy #172032 pozadina) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-12 pointer-events-auto">
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Labela sekcije */}
          <div ref={labelRef} className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-[#C9A063] mb-4">
            <span className="font-mono text-sm opacity-60">01</span>
            <span>O nama</span>
            <span className="w-8 h-[1px] bg-[#C9A063]/40"></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-16 items-center">
            {/* Leva kolona: Naslov i opis */}
            <div className="space-y-4">
              <h2
                ref={headingRef}
                className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
              >
                Tim koji stoji iza <span className="bg-gradient-to-r from-[#C9A063] to-[#F0D9A0] bg-clip-text text-transparent">rezultata</span>
              </h2>

              <p
                ref={descRef}
                className="text-sm sm:text-base lg:text-lg text-[#F5F0E6]/70 leading-relaxed font-['Inter']"
              >
                Bulevar.IT je tim mladih stručnjaka iz Novog Sada koji već više od 3 godine pomaže
                lokalnim biznisima da izgledaju ozbiljno online i privuku više klijenata. Radili smo
                sa restoranima, salonima, teretanama, e-commerce brendovima — i svima im je zajedničko
                jedno: hteli su više od lepog sajta. Hteli su rezultate. I to isporučujemo.
              </p>
            </div>

            {/* Desna kolona: 4 Info kartice */}
            <div ref={cardsRef} className="grid grid-cols-2 gap-3 sm:gap-4">
              {VALUES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-xl border border-[#C9A063]/15 bg-[#C9A063]/[0.04] backdrop-blur-md hover:bg-[#C9A063]/[0.08] hover:border-[#C9A063]/30 transition-all duration-300 group"
                >
                  <div className="text-xl sm:text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="font-['Space_Grotesk'] font-semibold text-sm sm:text-base mb-1 bg-gradient-to-r from-[#C9A063] to-[#F0D9A0] bg-clip-text text-transparent">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#F5F0E6]/60 leading-snug font-['Inter']">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PARALLAX SLOJEVI SLIKA (z-index: 20, pokriva ceo viewport) */}
      <div
        ref={parallaxWrapRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 w-full h-full overflow-hidden pointer-events-none"
      >
        {/* Navy prelaz gornje ivice za 100% nevidljiv spoj sa prethodnom sekcijom */}
        <div
          ref={topFadeRef}
          className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-[#172032] via-[#172032]/75 to-transparent z-30 pointer-events-none"
        />

        {/* CSS Grid sa 6 jednakih redova */}
        <div className="absolute inset-0 w-full h-full grid grid-rows-6 grid-cols-1 overflow-hidden">
          {/* Sloj 1 (Gornja osnova): grid-row 1 / span 4, 100% širine, z-index 1 */}
          <div
            ref={layer1Ref}
            className="row-start-1 row-span-4 col-start-1 col-end-2 w-full h-full relative overflow-hidden z-[1] will-change-transform [backface-visibility:hidden]"
          >
            <img
              ref={img1Ref}
              src="/01-osnova-gornja.jpg"
              alt="Bulevar IT kompozicija - Gornja osnova"
              className="w-full h-full object-cover object-bottom select-none pointer-events-none will-change-transform [backface-visibility:hidden]"
            />
          </div>

          {/* Sloj 2 (Srednji levi prozor): grid-row 4 / span 2, 44.15% širine, z-index 2 */}
          <div
            ref={layer2Ref}
            className="row-start-4 row-span-2 col-start-1 col-end-2 w-[44.15%] justify-self-start h-full relative overflow-hidden z-[2] will-change-transform [backface-visibility:hidden]"
          >
            <img
              ref={img2Ref}
              src="/03-srednji-levi.jpg"
              alt="Bulevar IT kompozicija - Srednji levi prozor"
              className="w-full h-full object-cover object-left select-none pointer-events-none will-change-transform [backface-visibility:hidden]"
            />
          </div>

          {/* Sloj 3 (Donji levi blok): grid-row 5 / span 2, 60% širine, z-index 3 */}
          <div
            ref={layer3Ref}
            className="row-start-5 row-span-2 col-start-1 col-end-2 w-[60%] justify-self-start h-full relative overflow-hidden z-[3] will-change-transform [backface-visibility:hidden]"
          >
            <img
              ref={img3Ref}
              src="/02-donji-levi.jpg"
              alt="Bulevar IT kompozicija - Donji levi blok"
              className="w-full h-full object-cover object-left select-none pointer-events-none will-change-transform [backface-visibility:hidden]"
            />
          </div>

          {/* Sloj 4 (Donji desni blok): grid-row 5 / span 2, margin-left 44.15%, 55.85% širine, z-index 4 */}
          <div
            ref={layer4Ref}
            className="row-start-5 row-span-2 col-start-1 col-end-2 ml-[44.15%] w-[55.85%] justify-self-start h-full relative overflow-hidden z-[4] will-change-transform [backface-visibility:hidden]"
          >
            <img
              ref={img4Ref}
              src="/04-donji-desni.jpg"
              alt="Bulevar IT kompozicija - Donji desni blok"
              className="w-full h-full object-cover object-right select-none pointer-events-none will-change-transform [backface-visibility:hidden]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
