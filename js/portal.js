import { auth, db, ADMIN_EMAIL, emailToId } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const PHASES = ["Análisis", "Diseño", "Desarrollo", "Pruebas", "Entregado"];

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.href = "login.html"; return; }
  if (user.email === ADMIN_EMAIL) { window.location.href = "admin.html"; return; }

  document.getElementById("user-name").textContent =
    user.displayName || user.email;

  // Escuchar cambios en tiempo real del proyecto
  const ref = doc(db, "clients", emailToId(user.email));
  onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      document.getElementById("no-project").hidden  = false;
      document.getElementById("project-data").hidden = true;
      return;
    }
    document.getElementById("no-project").hidden  = true;
    document.getElementById("project-data").hidden = false;
    renderProject(snap.data());
  });
});

function renderProject(data) {
  const phase = data.phase ?? 0;

  // Título y badge de fase actual
  document.getElementById("project-name").textContent = data.projectName || "Mi Proyecto";
  const badge = document.getElementById("phase-badge");
  badge.textContent = PHASES[phase] ?? "—";
  badge.className   = `phase-badge phase-badge-${phase}`;

  // Timeline de fases
  document.getElementById("phases-list").innerHTML = PHASES.map((name, i) => {
    const state = i < phase ? "done" : i === phase ? "active" : "";
    const icon  = i < phase ? "✓" : i + 1;
    return `
      <li class="phase-step ${state}" role="listitem">
        <div class="phase-dot">${icon}</div>
        <span>${name}</span>
      </li>`;
  }).join("");

  // Actualizaciones (más reciente primero)
  const updates = [...(data.updates || [])].reverse();
  document.getElementById("updates-list").innerHTML = updates.length
    ? updates.map((u) => `
        <div class="update-item">
          <span class="update-date">
            ${new Date(u.date).toLocaleDateString("es-CL", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </span>
          <p>${u.text}</p>
        </div>`).join("")
    : "<p class='empty-state'>Aún no hay actualizaciones publicadas.</p>";

  // Archivos
  const files = data.files || [];
  document.getElementById("files-list").innerHTML = files.length
    ? files.map((f) => `
        <a href="${f.url}" target="_blank" rel="noopener noreferrer" class="file-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          ${f.name}
          <svg class="file-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
          </svg>
        </a>`).join("")
    : "<p class='empty-state'>No hay archivos disponibles aún.</p>";
}

document.getElementById("btn-logout").addEventListener("click", () => {
  signOut(auth).then(() => { window.location.href = "login.html"; });
});
