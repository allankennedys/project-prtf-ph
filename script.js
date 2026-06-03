

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  const toggleMenu = (open) => {
    const next = open ?? !burger.classList.contains("is-open");
    burger.classList.toggle("is-open", next);
    mobileMenu.classList.toggle("is-open", next);
    burger.setAttribute("aria-expanded", String(next));
    mobileMenu.setAttribute("aria-hidden", String(!next));
    document.body.style.overflow = next ? "hidden" : "";
  };

  burger.addEventListener("click", () => toggleMenu());
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggleMenu(false))
  );

  const revealItems = document.querySelectorAll("[data-reveal], .hero__title .line");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const delay = Math.min(i * 60, 240);
        setTimeout(() => entry.target.classList.add("is-visible"), delay);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((el) => io.observe(el));

  const counters = document.querySelectorAll(".metric__num");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        prefersReduced
          ? (entry.target.textContent =
              parseFloat(entry.target.dataset.count).toFixed(
                parseInt(entry.target.dataset.decimals || "0", 10)
              ) + (entry.target.dataset.suffix || ""))
          : animateCount(entry.target);
        counterIO.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* ---------- Cursor customizado + magnetismo ---------- */
  const cursor = document.querySelector(".cursor");
  const interactive = document.querySelectorAll("a, button, [data-magnetic]");

  if (cursor && window.matchMedia("(pointer:fine)").matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const render = () => {
      cx += (tx - cx) * 0.5;
      cy += (ty - cy) * 0.5;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    interactive.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- Botões magnéticos ---------- */
  if (!prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Hero marquee: loop contínuo ---------- */
  const marqueeTrack = document.querySelector(".marquee__track");
  if (marqueeTrack && !prefersReduced) {
    const groups = marqueeTrack.querySelectorAll(".marquee__group");
    if (groups.length >= 2) {
      const seed = groups[0].innerHTML;

      const fillMarquee = () => {
        groups.forEach((group) => {
          group.innerHTML = seed;
          while (group.scrollWidth < window.innerWidth) {
            group.insertAdjacentHTML("beforeend", seed);
          }
        });
      };

      fillMarquee();
      window.addEventListener("resize", fillMarquee, { passive: true });
    }
  }

  /* ---------- Carrossel de projetos ---------- */
  const cardsSlider = document.getElementById("cardsSlider");
  const cardsTrack = document.getElementById("cardsTrack");
  const cardsPrev = document.getElementById("cardsPrev");
  const cardsNext = document.getElementById("cardsNext");

  if (cardsSlider && cardsTrack && cardsPrev && cardsNext) {
    const cards = [...cardsTrack.querySelectorAll(".card")];
    let index = 0;

    const getPerView = () => {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 1080) return 2;
      return 3;
    };

    const getStep = () => {
      const card = cards[0];
      if (!card) return 0;
      const gap = parseFloat(getComputedStyle(cardsTrack).gap) || 20;
      return card.offsetWidth + gap;
    };

    const getMaxIndex = () => Math.max(0, cards.length - getPerView());

    const updateSlider = () => {
      index = Math.min(index, getMaxIndex());
      const motion = prefersReduced ? "auto" : "0.65s cubic-bezier(0.16, 1, 0.3, 1)";
      cardsTrack.style.transition = `transform ${motion}`;
      cardsTrack.style.transform = `translateX(-${index * getStep()}px)`;
      cardsPrev.disabled = index === 0;
      cardsNext.disabled = index >= getMaxIndex();
    };

    cardsPrev.addEventListener("click", () => {
      index = Math.max(0, index - 1);
      updateSlider();
    });

    cardsNext.addEventListener("click", () => {
      index = Math.min(getMaxIndex(), index + 1);
      updateSlider();
    });

    window.addEventListener("resize", () => updateSlider(), { passive: true });
    updateSlider();
  }

  /* ---------- Parallax leve no glow do hero ---------- */
  const glow = document.querySelector(".hero__glow");
  if (glow && !prefersReduced) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) glow.style.transform = `translateY(${y * 0.25}px)`;
      },
      { passive: true }
    );
  }


  /* ---------- Atualiza ano no rodapé ---------- */
  const yearEl = document.querySelector(".footer span");
  if (yearEl) yearEl.textContent = yearEl.textContent.replace("2024", new Date().getFullYear());
})();