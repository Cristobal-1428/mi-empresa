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
