/* main.js — CP Studio */

// Año dinámico en el pie
document.querySelectorAll("#year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ── Menú móvil ──────────────────────────────────────
const toggle = document.querySelector(".nav-toggle");
const menu   = document.getElementById("nav-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ── Typewriter ───────────────────────────────────────
const typeEl = document.getElementById("typewriter");

if (typeEl) {
  const words = [
    "Desarrollo Web.",
    "Apps Móviles.",
    "Consultoría TI.",
    "Automatización.",
  ];
  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const word = words[wordIdx];
    typeEl.textContent = deleting
      ? word.slice(0, charIdx--)
      : word.slice(0, charIdx++);

    let delay = deleting ? 55 : 110;

    if (!deleting && charIdx > word.length) {
      delay = 1800;
      deleting = true;
    } else if (deleting && charIdx < 0) {
      deleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      delay = 350;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 600);
}

// ── Fade-in con IntersectionObserver ─────────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".fade-in").forEach((el, i) => {
  el.style.transitionDelay = `${i * 85}ms`;
  observer.observe(el);
});

// ── Modo día / noche ──────────────────────────────────
const THEME_KEY = "studiocp-theme";

const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.innerHTML = theme === "light" ? moonIcon : sunIcon;
    btn.setAttribute("aria-label", theme === "light" ? "Cambiar a modo noche" : "Cambiar a modo día");
    btn.title = theme === "light" ? "Modo noche" : "Modo día";
  }
}

// Crear botón flotante
const themeBtn = document.createElement("button");
themeBtn.id        = "theme-toggle";
themeBtn.className = "theme-toggle";
document.body.appendChild(themeBtn);

// Aplicar tema guardado (o noche por defecto)
const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
applyTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next    = current === "dark" ? "light" : "dark";

  // Activar transición suave
  document.documentElement.classList.add("theme-transition");
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);

  setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, 400);
});

// ── Formulario de contacto (Formsubmit.co) ───────────
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      note.style.color = "#f87171";
      note.textContent = "Por favor completa todos los campos.";
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Enviando…";
    note.style.color = "var(--color-muted)";
    note.textContent = "";

    try {
      const res = await fetch("https://formsubmit.co/ajax/studiocp.fc@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          nombre:  form.nombre.value,
          email:   form.email.value,
          mensaje: form.mensaje.value,
          _subject: "Nuevo mensaje desde StudioCP",
        }),
      });

      if (res.ok) {
        note.style.color = "var(--color-primary)";
        note.textContent = "¡Mensaje enviado! Te contactaremos pronto.";
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      note.style.color = "#f87171";
      note.textContent = "Hubo un error al enviar. Intenta de nuevo.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar mensaje";
    }
  });
}
