(() => {
  "use strict";

  /* =========================================================
     ELEMENTOS
  ========================================================= */
  const introScreen = document.getElementById("intro-screen");
  const discoverBtn = document.getElementById("discover-btn");
  const invitation = document.getElementById("invitation");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const audio = document.getElementById("bg-audio");
  const playToggle = document.getElementById("play-toggle");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const volumeRange = document.getElementById("volume-range");

  /* =========================================================
     REVELAR INVITACIÓN
  ========================================================= */
  function revealInvitation() {
    introScreen.classList.add("is-leaving");
    launchStarConfetti();

    setTimeout(() => {
      introScreen.setAttribute("hidden", "");
      invitation.removeAttribute("hidden");
      document.body.style.overflow = "auto";
      initScrollReveal();
      initStarDividers();
      attemptAutoplay();
    }, 500);
  }

  discoverBtn.addEventListener("click", revealInvitation, { once: true });

  /* =========================================================
     CONFETI DE ESTRELLAS (CANVAS)
  ========================================================= */
  function launchStarConfetti() {
    const ctx = confettiCanvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      confettiCanvas.width = window.innerWidth * dpr;
      confettiCanvas.height = window.innerHeight * dpr;
      confettiCanvas.style.width = window.innerWidth + "px";
      confettiCanvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const emojis = ["⭐", "✨", "🌟", "💫"];
    const count = window.innerWidth < 480 ? 60 : 110;
    const particles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1.4) * 14,
      size: 14 + Math.random() * 16,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      life: 0,
      maxLife: 90 + Math.random() * 40,
    }));

    let frame = 0;
    function tick() {
      frame++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;

      particles.forEach((p) => {
        if (p.life >= p.maxLife) return;
        alive = true;
        p.vy += 0.35; // gravedad
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life++;

        const opacity = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = Math.max(opacity, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      if (alive && frame < 200) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }
    requestAnimationFrame(tick);

    window.addEventListener("resize", resize, { passive: true });
  }

  /* =========================================================
     REPRODUCTOR DE MÚSICA
  ========================================================= */
  function attemptAutoplay() {
    audio.volume = parseFloat(volumeRange.value);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlayingUI(true))
        .catch(() => {
          // autoplay bloqueado por el navegador: esperar primer toque
          setPlayingUI(false);
          const resume = () => {
            audio
              .play()
              .then(() => setPlayingUI(true))
              .catch(() => {});
            document.removeEventListener("touchstart", resume);
            document.removeEventListener("click", resume);
          };
          document.addEventListener("touchstart", resume, {
            once: true,
            passive: true,
          });
          document.addEventListener("click", resume, { once: true });
        });
    }
  }

  function setPlayingUI(isPlaying) {
    iconPause.hidden = !isPlaying;
    iconPlay.hidden = isPlaying;
    playToggle.setAttribute(
      "aria-label",
      isPlaying ? "Pausar música" : "Reproducir música"
    );
  }

  playToggle.addEventListener("click", () => {
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlayingUI(true))
        .catch(() => {});
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });

  volumeRange.addEventListener("input", (e) => {
    audio.volume = parseFloat(e.target.value);
  });

  /* =========================================================
     COUNTDOWN
  ========================================================= */
  const EVENT_DATE = new Date("2026-09-06T17:30:00-06:00").getTime();
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    let diff = EVENT_DATE - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =========================================================
     SCROLL REVEAL
  ========================================================= */
  function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach((item) => observer.observe(item));
  }

  /* =========================================================
     ESTRELLAS GIRANDO CON EL SCROLL
  ========================================================= */
  function initStarDividers() {
    const stars = document.querySelectorAll("[data-star] span");
    let ticking = false;

    function updateStars() {
      const rotation = window.scrollY * 0.4;
      stars.forEach((star) => {
        star.style.transform = `rotate(${rotation}deg)`;
      });
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateStars);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateStars();
  }

  /* =========================================================
     AGREGAR AL CALENDARIO
  ========================================================= */
  const addCalendarBtn = document.getElementById("add-calendar");
  addCalendarBtn.addEventListener("click", () => {
    const start = "20260906T173000";
    const end = "20260906T213000";
    const details = encodeURIComponent(
      "Acompáñanos a celebrar los 2 añitos de Isabella Abigail."
    );
    const location = encodeURIComponent("Joy's Fiestas Infantiles");
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      "Cumpleaños de Isabella Abigail 🤠"
    )}&dates=${start}/${end}&details=${details}&location=${location}`;
    window.open(url, "_blank", "noopener");
  });

  /* =========================================================
     RSVP -> WHATSAPP
  ========================================================= */
  const rsvpSubmit = document.getElementById("rsvp-submit");
  const rsvpName = document.getElementById("rsvp-name");
  const rsvpGuests = document.getElementById("rsvp-guests");
  const rsvpMessage = document.getElementById("rsvp-message");

  rsvpSubmit.addEventListener("click", () => {
    const name = rsvpName.value.trim();
    if (!name) {
      rsvpName.focus();
      rsvpName.style.borderColor = "#E0459C";
      return;
    }
    const guests = rsvpGuests.value.trim() || "0";
    const message = rsvpMessage.value.trim();

    let text = `¡Hola! Confirmo mi asistencia a los 2 añitos de Isabella Abigail 🤠\n\n`;
    text += `Nombre: ${name}\n`;
    text += `Acompañantes: ${guests}\n`;
    if (message) text += `Mensaje para Isabella: ${message}\n`;

    const url = `https://wa.me/528441748140?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  });
})();
