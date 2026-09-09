/* =====================================================================
   Dansereau Traiteur · Accueil · motion (GSAP 3.13 + ScrollTrigger + SplitText + Lenis)
   Règles du design system : on n'anime que transform / opacity / filter.
   Easing unique cubic-bezier(0.16,1,0.3,1) ≈ "expo.out". Durées 250 / 600 / 900 ms.
   prefers-reduced-motion : tout est désactivé, contenu visible d'emblée.
   ===================================================================== */
(function () {
  'use strict';

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ok = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var doc = document.documentElement;
  var entete = document.getElementById('entete');
  var overlay = document.getElementById('menu-overlay');
  var btnOuvrir = document.getElementById('ouvrir-menu');
  var btnFermer = document.getElementById('fermer-menu');
  var panneau = overlay.querySelector('.overlay-panneau');
  var video = document.getElementById('hero-video');
  var btnPause = document.getElementById('hero-pause');
  var univers = document.querySelector('.univers');
  var EASE = 'expo.out';
  var menuOuvert = false;
  var lenis = null;

  /* ------------------------------------------------------------------
     Vidéo hero : fondu quand elle joue vraiment, bouton pause accessible
     ------------------------------------------------------------------ */
  if (video) {
    if (reduit) {
      video.removeAttribute('autoplay');
      video.pause();
      if (btnPause) btnPause.hidden = true;
    } else {
      var montrer = function () { video.classList.add('est-prete'); };
      video.addEventListener('playing', montrer, { once: true });
      if (!video.paused && video.readyState >= 3) montrer();
      var lecture = video.play();
      if (lecture && lecture.catch) lecture.catch(function () { /* autoplay refusé : l'affiche reste */ });
    }
    if (btnPause) {
      btnPause.addEventListener('click', function () {
        if (video.paused) {
          video.play();
          btnPause.textContent = 'Pause vidéo';
          btnPause.setAttribute('aria-pressed', 'false');
        } else {
          video.pause();
          btnPause.textContent = 'Lire la vidéo';
          btnPause.setAttribute('aria-pressed', 'true');
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     Menu overlay : ouverture / fermeture, inert sur le reste, Échap
     ------------------------------------------------------------------ */
  var zonesInertes = [document.querySelector('main'), entete, document.querySelector('footer')].filter(Boolean);
  function ouvrirMenu() {
    if (menuOuvert) return;
    menuOuvert = true;
    overlay.classList.add('est-ouvert');
    btnOuvrir.setAttribute('aria-expanded', 'true');
    zonesInertes.forEach(function (z) { z.inert = true; });
    doc.classList.add('menu-ouvert');
    if (lenis) lenis.stop(); else doc.style.overflow = 'hidden';
    entete.classList.remove('est-cachee');
    if (ok && !reduit) {
      gsap.killTweensOf([overlay, panneau, '.overlay-anim']);
      gsap.timeline()
        .to(overlay, { opacity: 1, duration: 0.45, ease: 'power2.out' })
        .fromTo(panneau, { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: EASE, clearProps: 'transform' }, 0.05)
        .fromTo('.overlay-anim', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: EASE, clearProps: 'transform' }, 0.2);
    } else {
      overlay.style.opacity = 1;
    }
    btnFermer.focus();
  }
  function fermerMenu() {
    if (!menuOuvert) return;
    menuOuvert = false;
    btnOuvrir.setAttribute('aria-expanded', 'false');
    zonesInertes.forEach(function (z) { z.inert = false; });
    doc.classList.remove('menu-ouvert');
    if (lenis) lenis.start(); else doc.style.overflow = '';
    var fin = function () { overlay.classList.remove('est-ouvert'); };
    if (ok && !reduit) {
      gsap.killTweensOf([overlay, panneau, '.overlay-anim']);
      gsap.to(overlay, { opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: fin });
    } else { overlay.style.opacity = 0; fin(); }
    btnOuvrir.focus();
  }
  btnOuvrir.addEventListener('click', ouvrirMenu);
  btnFermer.addEventListener('click', fermerMenu);
  overlay.addEventListener('click', function (e) { if (menuOuvert && !panneau.contains(e.target)) fermerMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOuvert) fermerMenu(); });
  overlay.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var cible = document.querySelector(a.getAttribute('href'));
      fermerMenu();
      if (cible) {
        e.preventDefault();
        setTimeout(function () { defilerVers(cible); }, 380);
      }
    });
  });

  /* ------------------------------------------------------------------
     Défilement : Lenis (lisse) + ancres
     ------------------------------------------------------------------ */
  function defilerVers(cible) {
    if (lenis) lenis.scrollTo(cible, { offset: -8, duration: 1.4 });
    else cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth' });
  }
  if (ok && !reduit && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (overlay.contains(a)) return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var cible = document.querySelector(id);
      if (!cible) return;
      e.preventDefault();
      defilerVers(cible);
    });
  });

  /* ------------------------------------------------------------------
     Sans GSAP ou en mouvement réduit : images en couleur, on s'arrête là
     ------------------------------------------------------------------ */
  if (!ok || reduit) {
    document.querySelectorAll('.carte-univers, .split-figure, .bande').forEach(function (el) { el.classList.add('en-vue'); });
    var flou = function () { entete.classList.toggle('est-flou', window.scrollY > 40); };
    window.addEventListener('scroll', flou, { passive: true });
    flou();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

  /* ------------------------------------------------------------------
     En-tête : flou dès 40px, se cache en descendant, thème selon la section
     ------------------------------------------------------------------ */
  var sectionActive = null;
  function appliquerTheme() {
    if (!sectionActive) return;
    var sombre = sectionActive.classList.contains('est-sombre') || sectionActive.dataset.theme === 'sombre';
    entete.dataset.theme = sombre ? 'sombre' : 'clair';
  }
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      entete.classList.toggle('est-flou', y > 40);
      if (menuOuvert) return;
      var descend = self.direction === 1;
      entete.classList.toggle('est-cachee', descend && y > 320);
    }
  });
  gsap.utils.toArray('[data-theme]').forEach(function (sec) {
    if (sec === entete) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 60px', end: 'bottom 60px',
      onToggle: function (self) { if (self.isActive) { sectionActive = sec; appliquerTheme(); } }
    });
  });

  /* ------------------------------------------------------------------
     Hero : entrée (masques par ligne) puis léger enfoncement au scroll
     ------------------------------------------------------------------ */
  var intro = gsap.timeline({ defaults: { ease: EASE } });
  intro
    .from('.hero-titre .mot', { yPercent: 108, duration: 1.4, stagger: 0.14 }, 0.45)
    .from('.hero-actions > *', { opacity: 0, y: 14, duration: 0.9, stagger: 0.1 }, 1.05)
    .from('.hero-pied > *', { opacity: 0, duration: 0.9 }, 1.3)
    .from('.entete > *', { opacity: 0, y: -8, duration: 0.9, stagger: 0.06, clearProps: 'all' }, 0.7);

  gsap.to('.hero-media', {
    scale: 1.08, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '.apres-hero', start: 'top bottom', end: 'top top', scrub: 0.4 }
  });
  gsap.to('.hero-contenu', {
    y: -70, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.apres-hero', start: 'top bottom', end: 'top 35%', scrub: 0.4 }
  });
  gsap.to('.hero-pied', {
    opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.apres-hero', start: 'top bottom', end: 'top 70%', scrub: true }
  });

  /* ------------------------------------------------------------------
     Reveals : après le chargement des polices (SplitText mesure les lignes)
     ------------------------------------------------------------------ */
  function reveals() {
    /* titres : lignes masquées qui montent */
    document.querySelectorAll('.titre-lignes').forEach(function (h) {
      var lignes = null;
      if (typeof SplitText !== 'undefined') {
        try { lignes = SplitText.create(h, { type: 'lines', mask: 'lines', linesClass: 'ligne-split' }).lines; }
        catch (err) { lignes = null; }
      }
      var st = { trigger: h, start: 'top 86%', once: true };
      if (lignes && lignes.length) gsap.from(lignes, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: EASE, scrollTrigger: st });
      else gsap.from(h, { opacity: 0, y: 18, duration: 0.9, ease: EASE, scrollTrigger: st });
    });

    /* blocs simples */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 18, duration: 0.9, ease: EASE, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    /* groupes en cascade */
    gsap.utils.toArray('[data-reveal-groupe]').forEach(function (g) {
      gsap.from(g.children, { opacity: 0, y: 16, duration: 0.8, stagger: 0.08, ease: EASE, scrollTrigger: { trigger: g, start: 'top 88%', once: true } });
    });

    /* cartes des univers : montée + N&B vers couleur à l'entrée */
    gsap.utils.toArray('.carte-univers').forEach(function (c, i) {
      gsap.from(c, { opacity: 0, y: 48, duration: 1.1, ease: EASE, delay: (i % 2) * 0.1, scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
      ScrollTrigger.create({ trigger: c, start: 'top 62%', once: true, onEnter: function () { c.classList.add('en-vue'); } });
    });

    /* section univers : crème vers noir carbone en entrant, retour en remontant */
    if (univers) {
      ScrollTrigger.create({
        trigger: univers, start: 'top 42%',
        onEnter: function () { univers.classList.add('est-sombre'); appliquerTheme(); },
        onLeaveBack: function () { univers.classList.remove('est-sombre'); appliquerTheme(); }
      });
    }

    /* bande : parallaxe douce + couleur */
    var bande = document.querySelector('.bande');
    if (bande) {
      gsap.fromTo('.bande-media img', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: bande, start: 'top bottom', end: 'bottom top', scrub: true } });
      ScrollTrigger.create({ trigger: bande, start: 'top 55%', once: true, onEnter: function () { bande.classList.add('en-vue'); } });
    }

    /* split : couleur à l'entrée */
    var fig = document.querySelector('.split-figure');
    if (fig) ScrollTrigger.create({ trigger: fig, start: 'top 60%', once: true, onEnter: function () { fig.classList.add('en-vue'); } });

    /* logo géant : monte doucement quand le pied arrive */
    gsap.from('.logo-geant span', { yPercent: 55, ease: 'none', scrollTrigger: { trigger: '.pied', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reveals);
  else window.addEventListener('load', reveals);

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
