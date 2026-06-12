import { auth, db, ADMIN_EMAIL, emailToId } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const PHASES = ["Análisis", "Diseño", "Desarrollo", "Pruebas", "Entregado"];

let selectedId   = null;
let unsubClient  = null; // para cancelar el listener anterior

// ── Auth guard ────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    window.location.href = "login.html";
    return;
  }
  loadClients();
});

// ── Lista de clientes (tiempo real) ──────────────────
function loadClients() {
  onSnapshot(collection(db, "clients"), (snap) => {
    const listEl = document.getElementById("clients-list");

    if (snap.empty) {
      listEl.innerHTML = "<p class='empty-state'>Aún no hay clientes.</p>";
      return;
    }

    listEl.innerHTML = snap.docs.map((d) => {
      const data = d.data();
      return `
        <button class="client-item ${d.id === selectedId ? "active" : ""}"
                data-id="${d.id}">
          <strong>${data.projectName || "Sin nombre"}</strong>
          <span>${data.email || ""}</span>
        </button>`;
    }).join("");

    listEl.querySelectorAll(".client-item").forEach((btn) => {
      btn.addEventListener("click", () => selectClient(btn.dataset.id));
    });
  });
}

// ── Seleccionar cliente ───────────────────────────────
function selectClient(id) {
  selectedId = id;

  // Cancelar listener previo
  if (unsubClient) unsubClient();

  document.getElementById("no-selection").hidden = true;
  document.getElementById("editor-panel").hidden  = false;

  unsubClient = onSnapshot(doc(db, "clients", id), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    document.getElementById("edit-title").textContent        = data.projectName || "Sin nombre";
    document.getElementById("edit-email-display").textContent = data.email || "";
    document.getElementById("edit-phase").value              = data.phase ?? 0;
  });

  // Re-highlight en la lista
  document.querySelectorAll(".client-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === id);
  });
}

// ── Crear nuevo cliente ───────────────────────────────
document.getElementById("form-new-client").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name    = document.getElementById("new-name").value.trim();
  const email   = document.getElementById("new-email").value.trim().toLowerCase();
  const project = document.getElementById("new-project").value.trim();
  const id      = emailToId(email);

  try {
    await setDoc(doc(db, "clients", id), {
      clientName:  name,
      email:       email,
      projectName: project,
      phase:       0,
      updates:     [],
      files:       [],
      createdAt:   Date.now(),
    });
    e.target.reset();
    showInlineNote("new-client-note", "✓ Cliente creado. Dile que se registre en login.html", false);
  } catch {
    showInlineNote("new-client-note", "Error al crear el cliente.", true);
  }
});

// ── Actualizar fase ───────────────────────────────────
document.getElementById("form-phase").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedId) return;
  const phase = parseInt(document.getElementById("edit-phase").value);
  await updateDoc(doc(db, "clients", selectedId), { phase });
  showFeedback(`Fase actualizada a: ${PHASES[phase]}`);
});

// ── Publicar actualización ────────────────────────────
document.getElementById("form-update").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedId) return;
  const text = document.getElementById("update-text").value.trim();
  if (!text) return;

  await updateDoc(doc(db, "clients", selectedId), {
    updates: arrayUnion({ text, date: Date.now(), author: "StudioCP" }),
  });
  document.getElementById("update-text").value = "";
  showFeedback("Actualización publicada.");
});

// ── Agregar archivo ───────────────────────────────────
document.getElementById("form-file").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedId) return;
  const name = document.getElementById("file-name").value.trim();
  const url  = document.getElementById("file-url").value.trim();

  await updateDoc(doc(db, "clients", selectedId), {
    files: arrayUnion({ name, url, addedAt: Date.now() }),
  });
  e.target.reset();
  showFeedback("Archivo agregado.");
});

// ── Logout ────────────────────────────────────────────
document.getElementById("btn-logout").addEventListener("click", () => {
  signOut(auth).then(() => { window.location.href = "login.html"; });
});

// ── Helpers ───────────────────────────────────────────
function showFeedback(msg) {
  const el       = document.getElementById("admin-note");
  el.textContent = msg;
  el.style.color = "var(--color-primary)";
  setTimeout(() => { el.textContent = ""; }, 3000);
}

function showInlineNote(id, msg, isError) {
  const el       = document.getElementById(id);
  el.textContent = msg;
  el.style.color = isError ? "#f87171" : "var(--color-primary)";
}
