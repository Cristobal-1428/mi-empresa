import { auth, ADMIN_EMAIL } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Si ya hay sesión activa, redirigir
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = user.email === ADMIN_EMAIL ? "admin.html" : "portal.html";
  }
});

// ── Google ────────────────────────────────────────────
document.getElementById("btn-google").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch {
    showNote("Error al iniciar con Google. Intenta de nuevo.", true);
  }
});

// ── Alternar Login / Registro ─────────────────────────
let isRegister = false;

document.getElementById("toggle-mode").addEventListener("click", () => {
  isRegister = !isRegister;
  document.getElementById("auth-title").textContent  = isRegister ? "Crear cuenta" : "Accede a tu portal";
  document.getElementById("btn-submit").textContent  = isRegister ? "Crear cuenta"  : "Iniciar sesión";
  document.getElementById("toggle-mode").textContent = isRegister ? "Inicia sesión" : "Regístrate";
  document.getElementById("toggle-label").textContent = isRegister
    ? "¿Ya tienes cuenta? "
    : "¿No tienes cuenta? ";
  showNote("", false);
});

// ── Formulario email / contraseña ─────────────────────
document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const btn      = document.getElementById("btn-submit");

  btn.disabled    = true;
  btn.textContent = "Espera…";

  try {
    if (isRegister) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    const msgs = {
      "auth/email-already-in-use":  "Ese correo ya tiene una cuenta. Inicia sesión.",
      "auth/invalid-credential":    "Correo o contraseña incorrectos.",
      "auth/user-not-found":        "No existe una cuenta con ese correo.",
      "auth/wrong-password":        "Contraseña incorrecta.",
      "auth/weak-password":         "La contraseña debe tener al menos 6 caracteres.",
      "auth/invalid-email":         "El correo no es válido.",
    };
    showNote(msgs[err.code] || "Error al autenticar. Intenta de nuevo.", true);
    btn.disabled    = false;
    btn.textContent = isRegister ? "Crear cuenta" : "Iniciar sesión";
  }
});

function showNote(msg, isError) {
  const el        = document.getElementById("auth-note");
  el.textContent  = msg;
  el.style.color  = isError ? "#f87171" : "var(--color-primary)";
}
