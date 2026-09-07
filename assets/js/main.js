/* ==========================================================================
   Apnée du sommeil — interactions du site
   Aucune dépendance. Tout est progressif : sans JavaScript, le contenu reste
   lisible et accessible.
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------------------------------------------------------------------
     Navigation mobile
     --------------------------------------------------------------------- */
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".nav__links a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------------------------------------------------------------------
     Apparition au défilement
     --------------------------------------------------------------------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------------------------------------------------------------
     Compteurs animés  <span data-count="6.4" data-decimals="1" data-prefix="" data-suffix=" M">
     --------------------------------------------------------------------- */
  const counters = $$("[data-count]");
  const formatNumber = (n, decimals) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    if (reduceMotion) {
      el.textContent = prefix + formatNumber(target, decimals) + suffix;
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + formatNumber(target * eased, decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if ("IntersectionObserver" in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              runCounter(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => cio.observe(c));
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------------------------------------------------------------------
     Sous-navigation : lien actif selon la section visible
     --------------------------------------------------------------------- */
  const subLinks = $$(".subnav__links a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    subLinks.forEach((a) => {
      const target = $(a.getAttribute("href"));
      if (target) map.set(target, a);
    });
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            subLinks.forEach((a) => a.classList.remove("is-active"));
            const a = map.get(e.target);
            if (a) a.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    map.forEach((_, section) => sio.observe(section));
  }

  /* ---------------------------------------------------------------------
     Scrollytelling : voies aériennes
     --------------------------------------------------------------------- */
  const scrolly = $(".scrolly");
  if (scrolly) {
    const steps = $$(".scrolly__step", scrolly);
    const dots = $$(".scrolly__progress span", scrolly);
    const tongue = $("#airway .tongue");
    const palate = $("#airway .palate");
    const flow = $("#airway .flow");
    const o2 = $("#airway .o2");
    const o2Text = $("#airway .o2-text");
    const snore = $("#airway .snore");
    const statusText = $("#airway .status-text");
    const statusNames = ["Respiration normale", "Ronflement", "Apnée", "Micro-éveil"];
    let current = -1;

    const update = () => {
      const rect = scrolly.getBoundingClientRect();
      const total = scrolly.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / total, 0, 1);
      const n = steps.length;
      const idx = Math.min(n - 1, Math.floor(progress * n));

      // Obstruction : 0 (ouvert) -> 1 (fermé) puis réouverture au micro-éveil
      let obstruction;
      if (idx === 0) obstruction = 0;
      else if (idx === 1) obstruction = 0.55;
      else if (idx === 2) obstruction = 1;
      else obstruction = 0.05;

      if (tongue) tongue.style.transform = `translate(${obstruction * 10}px, ${-obstruction * 26}px) scale(${1 + obstruction * 0.08})`;
      if (palate) palate.style.transform = `rotate(${obstruction * 14}deg) translate(0, ${obstruction * 6}px)`;
      if (flow) flow.style.opacity = String(1 - obstruction * 0.95);
      if (o2) {
        const sat = Math.round(97 - obstruction * 12);
        o2.setAttribute("fill", obstruction > 0.8 ? "#ff3b30" : obstruction > 0.4 ? "#ff9f0a" : "#34c759");
        if (o2Text) o2Text.textContent = `SpO₂ ${sat} %`;
      }
      if (snore) snore.classList.toggle("is-on", idx === 1);
      if (statusText) statusText.textContent = statusNames[idx] || "";

      if (idx !== current) {
        current = idx;
        steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { update(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------------------------------------------------------------------
     Curseur IAH (indice d'apnées-hypopnées)
     --------------------------------------------------------------------- */
  const iahInput = $("#iah-input");
  if (iahInput) {
    const value = $("#iah-value");
    const level = $("#iah-level");
    const note = $("#iah-note");
    const levels = [
      { max: 5, label: "Pas de syndrome d'apnées", color: "#248a3d", text: "Moins de 5 événements par heure : c'est dans les limites de la normale. Quelques apnées isolées peuvent survenir chez tout le monde." },
      { max: 15, label: "Apnée du sommeil légère", color: "#b08a00", text: "Entre 5 et 15 événements par heure. Le diagnostic se pose si des symptômes sont associés (somnolence, ronflements, réveils étouffés…). Les mesures d'hygiène de vie sont au premier plan." },
      { max: 30, label: "Apnée du sommeil modérée", color: "#b25e00", text: "Entre 15 et 30 événements par heure. Un traitement est recommandé : orthèse d'avancée mandibulaire en première intention si vous n'avez pas de maladie cardiovasculaire grave, sinon pression positive continue (PPC)." },
      { max: Infinity, label: "Apnée du sommeil sévère", color: "#c0271c", text: "Plus de 30 événements par heure. Le traitement de référence est la ventilation par pression positive continue (PPC), quel que soit le niveau de somnolence." },
    ];
    const render = () => {
      const v = parseInt(iahInput.value, 10);
      const l = levels.find((x) => v < x.max) || levels[levels.length - 1];
      value.textContent = v;
      level.textContent = l.label;
      level.style.color = l.color;
      const perNight = Math.round(v * 7);
      const every = v > 0 ? Math.round(60 / v) : null;
      note.innerHTML =
        l.text +
        (v > 0
          ? ` Pour une nuit de 7 heures, cela représente environ <strong>${perNight.toLocaleString("fr-FR")} événements</strong>, soit en moyenne un toutes les <strong>${every >= 1 ? every + " min" : "moins d'une minute"}</strong>.`
          : "");
      iahInput.style.setProperty("--pct", (v / iahInput.max) * 100 + "%");
    };
    iahInput.addEventListener("input", render);
    render();
  }

  /* ---------------------------------------------------------------------
     Test d'Epworth
     --------------------------------------------------------------------- */
  const epworth = $("#epworth-form");
  if (epworth) {
    const score = $("#epworth-score");
    const verdict = $("#epworth-verdict");
    const text = $("#epworth-text");
    const counter = $("#epworth-count");
    const reset = $("#epworth-reset");
    const total = $$(".epworth__q", epworth).length;

    const interpret = (s) => {
      if (s <= 10) return ["Somnolence dans les limites de la normale", "#248a3d", "Votre score ne suggère pas de somnolence diurne excessive. Si vous ronflez fort, si votre entourage observe des pauses respiratoires ou si vous avez d'autres symptômes, parlez-en tout de même à votre médecin : l'apnée du sommeil n'entraîne pas toujours de somnolence."];
      if (s <= 14) return ["Somnolence diurne légère", "#b08a00", "Un score supérieur à 10 traduit une somnolence diurne excessive. Il est conseillé d'en parler à votre médecin traitant, qui pourra rechercher une cause, dont une apnée du sommeil."];
      if (s <= 17) return ["Somnolence diurne modérée", "#b25e00", "Ce niveau de somnolence justifie une consultation médicale et, le plus souvent, un enregistrement du sommeil (polygraphie ou polysomnographie) pour en identifier la cause."];
      return ["Somnolence diurne sévère", "#c0271c", "Ce niveau de somnolence mérite une consultation rapide. Il augmente le risque d'accident : soyez particulièrement prudent au volant et lors d'activités dangereuses en attendant l'avis médical."];
    };

    const compute = () => {
      let sum = 0;
      let answered = 0;
      $$(".epworth__q", epworth).forEach((q) => {
        const checked = $("input:checked", q);
        if (checked) {
          sum += parseInt(checked.value, 10);
          answered += 1;
        }
      });
      counter.textContent = `${answered} / ${total} situations renseignées`;
      if (answered === total) {
        const [label, color, body] = interpret(sum);
        score.innerHTML = `${sum}<small>/ 24</small>`;
        verdict.textContent = label;
        verdict.style.color = color;
        text.textContent = body;
      } else {
        score.innerHTML = `${sum}<small>/ 24</small>`;
        verdict.textContent = "Répondez aux 8 situations";
        verdict.style.color = "";
        text.textContent = "Le score ne s'interprète qu'une fois toutes les situations renseignées.";
      }
    };
    epworth.addEventListener("change", compute);
    if (reset) {
      reset.addEventListener("click", () => {
        epworth.reset();
        compute();
      });
    }
    compute();
  }


  /* ---------------------------------------------------------------------
     Questionnaire STOP-Bang (+ calcul de l'IMC)
     --------------------------------------------------------------------- */
  const sb = $("#stopbang-form");
  if (sb) {
    const score = $("#sb-score");
    const verdict = $("#sb-verdict");
    const text = $("#sb-text");
    const counter = $("#sb-count");
    const reset = $("#sb-reset");
    const qs = $$(".epworth__q", sb);
    const total = qs.length;
    const hInput = $("#sb-height");
    const wInput = $("#sb-weight");
    const bmiOut = $("#sb-bmi");

    const interpret = (s) => {
      if (s <= 2) return ["Risque faible", "#248a3d", "Le questionnaire ne suggère pas de risque particulier d'apnée du sommeil. Si des symptômes vous inquiètent malgré tout, parlez-en à votre médecin."];
      if (s <= 4) return ["Risque intermédiaire", "#b25e00", "Ce score justifie d'en parler à votre médecin, en particulier si vous êtes un homme, si votre IMC dépasse 35 ou si votre tour de cou est important. Un enregistrement du sommeil permet de trancher."];
      return ["Risque élevé", "#c0271c", "La probabilité d'un syndrome d'apnées du sommeil, souvent modéré à sévère, est importante. Un dépistage par polygraphie à domicile est recommandé sans tarder."];
    };

    const updateBmi = () => {
      if (!hInput || !wInput || !bmiOut) return;
      const h = parseFloat(hInput.value) / 100;
      const w = parseFloat(wInput.value);
      if (h > 0.5 && w > 20) {
        const bmi = w / (h * h);
        bmiOut.innerHTML = `IMC : <strong>${bmi.toFixed(1)}</strong>`;
        const target = $(`input[name="b"][value="${bmi > 35 ? 1 : 0}"]`, sb);
        if (target && !target.checked) { target.checked = true; }
      } else {
        bmiOut.textContent = "";
      }
    };

    const compute = () => {
      let sum = 0, answered = 0;
      qs.forEach((q) => {
        const c = $("input:checked", q);
        if (c) { sum += parseInt(c.value, 10); answered += 1; }
      });
      counter.textContent = `${answered} / ${total} questions renseignées`;
      score.innerHTML = `${sum}<small>/ 8</small>`;
      if (answered === total) {
        const [label, color, body] = interpret(sum);
        verdict.textContent = label; verdict.style.color = color; text.textContent = body;
      } else {
        verdict.textContent = "Répondez aux 8 questions"; verdict.style.color = "";
        text.textContent = "Le score ne s'interprète qu'une fois toutes les questions renseignées.";
      }
    };
    sb.addEventListener("change", compute);
    sb.addEventListener("input", (e) => { if (e.target === hInput || e.target === wInput) { updateBmi(); compute(); } });
    if (reset) reset.addEventListener("click", () => { sb.reset(); if (bmiOut) bmiOut.textContent = ""; compute(); });
    compute();
  }

  /* ---------------------------------------------------------------------
     Galerie horizontale : boutons précédent / suivant
     --------------------------------------------------------------------- */
  $$("[data-rail]").forEach((wrap) => {
    const rail = $(".rail", wrap);
    const prev = $("[data-rail-prev]", wrap);
    const next = $("[data-rail-next]", wrap);
    if (!rail) return;
    const step = () => Math.min(rail.clientWidth * 0.8, 440);
    if (prev) prev.addEventListener("click", () => rail.scrollBy({ left: -step(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => rail.scrollBy({ left: step(), behavior: "smooth" }));
  });

  /* ---------------------------------------------------------------------
     Accordéons : animation douce à l'ouverture / fermeture
     --------------------------------------------------------------------- */
  $$(".faq details").forEach((details) => {
    const summary = $("summary", details);
    const body = $(".faq__body", details);
    if (!summary || !body || reduceMotion) return;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (details.open) {
        const h = body.offsetHeight;
        body.style.height = h + "px";
        body.style.overflow = "hidden";
        requestAnimationFrame(() => {
          body.style.transition = "height 0.35s cubic-bezier(0.2,0.65,0.3,1), opacity 0.25s";
          body.style.height = "0px";
          body.style.opacity = "0";
        });
        body.addEventListener("transitionend", function done() {
          body.removeEventListener("transitionend", done);
          details.open = false;
          body.style.cssText = "";
        });
      } else {
        details.open = true;
        const h = body.offsetHeight;
        body.style.height = "0px";
        body.style.opacity = "0";
        body.style.overflow = "hidden";
        requestAnimationFrame(() => {
          body.style.transition = "height 0.4s cubic-bezier(0.2,0.65,0.3,1), opacity 0.35s 0.05s";
          body.style.height = h + "px";
          body.style.opacity = "1";
        });
        body.addEventListener("transitionend", function done() {
          body.removeEventListener("transitionend", done);
          body.style.cssText = "";
        });
      }
    });
  });

  /* ---------------------------------------------------------------------
     Parallaxe légère du héros et bouton "retour en haut"
     --------------------------------------------------------------------- */
  const heroVisual = $(".hero__visual");
  const toTop = $(".to-top");
  const onScrollMisc = () => {
    const y = window.scrollY;
    if (heroVisual && !reduceMotion) {
      heroVisual.style.transform = `translateY(${y * 0.25}px)`;
      heroVisual.style.opacity = String(clamp(1 - y / 700, 0, 1));
    }
    if (toTop) toTop.classList.toggle("is-visible", y > 800);
  };
  window.addEventListener("scroll", onScrollMisc, { passive: true });
  onScrollMisc();
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------------------------------------------------------------------
     Année du pied de page
     --------------------------------------------------------------------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
