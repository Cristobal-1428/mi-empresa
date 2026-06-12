import { auth, db, ADMIN_EMAIL, emailToId } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Si ya hay sesión activa, redirigir
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = user.email === ADMIN_EMAIL ? "admin.html" : "portal.html";
  }
});

// ── Google ─────────────────────────────────────────
document.getElementById("btn-google").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch {
    showNote("Error al iniciar con Google. Intenta de nuevo.", true);
  }
});

// ── Alternar Login ↔ Registro ──────────────────────
let isRegister = false;

document.getElementById("toggle-mode").addEventListener("click", () => {
  isRegister = !isRegister;
  toggleRegisterMode(isRegister);
  showNote("", false);
  document.getElementById("auth-password").value = "";
  document.getElementById("auth-confirm").value  = "";
  resetHints();
});

function toggleRegisterMode(on) {
  document.getElementById("register-extra").hidden  = !on;
  document.getElementById("confirm-field").hidden   = !on;
  document.getElementById("pw-hints").hidden        = !on;

  document.getElementById("auth-nombre").required   = on;
  document.getElementById("auth-apellido").required = on;
  document.getElementById("auth-pais").required     = on;
  document.getElementById("auth-confirm").required  = on;

  document.getElementById("auth-title").textContent  = on ? "Crear cuenta"   : "Accede a tu portal";
  document.getElementById("auth-sub").textContent    = on ? "Completa tus datos para registrarte." : "Consulta el estado de tu proyecto en tiempo real.";
  document.getElementById("btn-submit").textContent  = on ? "Crear cuenta"   : "Iniciar sesión";
  document.getElementById("toggle-mode").textContent = on ? "Inicia sesión"  : "Regístrate";
  document.getElementById("toggle-label").textContent = on
    ? "¿Ya tienes cuenta? "
    : "¿No tienes cuenta? ";
}

// ── Validación de contraseña en tiempo real ────────
const pwInput      = document.getElementById("auth-password");
const confirmInput = document.getElementById("auth-confirm");

pwInput.addEventListener("input", () => {
  if (!isRegister) return;
  const pwd = pwInput.value;
  setHint("hint-length",  pwd.length >= 5);
  setHint("hint-number",  /\d/.test(pwd));
  setHint("hint-special", /[^a-zA-Z0-9]/.test(pwd));
  checkConfirm();
});

confirmInput.addEventListener("input", checkConfirm);

function checkConfirm() {
  const hint = document.getElementById("confirm-hint");
  if (!confirmInput.value) { hint.textContent = ""; return; }
  const match = pwInput.value === confirmInput.value;
  hint.textContent = match ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden";
  hint.style.color = match ? "var(--color-primary)" : "#f87171";
}

function setHint(id, ok) {
  document.getElementById(id).classList.toggle("hint-ok", ok);
}

function resetHints() {
  ["hint-length", "hint-number", "hint-special"].forEach((id) => {
    document.getElementById(id).classList.remove("hint-ok");
  });
  const hint = document.getElementById("confirm-hint");
  hint.textContent = "";
}

function validatePassword(pwd) {
  return {
    length:  pwd.length >= 5,
    number:  /\d/.test(pwd),
    special: /[^a-zA-Z0-9]/.test(pwd),
  };
}

// ── Submit ─────────────────────────────────────────
document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("auth-email").value.trim().toLowerCase();
  const password = document.getElementById("auth-password").value;
  const btn      = document.getElementById("btn-submit");

  btn.disabled    = true;
  btn.textContent = "Espera…";

  try {
    if (isRegister) {
      await handleRegister(email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    const msgs = {
      "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Inicia sesión.",
      "auth/invalid-credential":   "Correo o contraseña incorrectos.",
      "auth/user-not-found":       "No existe una cuenta con ese correo.",
      "auth/wrong-password":       "Contraseña incorrecta.",
      "auth/invalid-email":        "El correo no es válido.",
    };
    showNote(msgs[err.code] || err.message || "Error al autenticar.", true);
    btn.disabled    = false;
    btn.textContent = isRegister ? "Crear cuenta" : "Iniciar sesión";
  }
});

async function handleRegister(email, password) {
  const nombre   = document.getElementById("auth-nombre").value.trim();
  const apellido = document.getElementById("auth-apellido").value.trim();
  const pais     = document.getElementById("auth-pais").value;
  const confirm  = document.getElementById("auth-confirm").value;

  // Validar campos vacíos
  if (!nombre || !apellido || !pais) {
    throw { code: null, message: "Completa todos los campos del formulario." };
  }

  // Validar contraseña
  const v = validatePassword(password);
  if (!v.length) {
    throw { code: null, message: "La contraseña debe tener al menos 5 caracteres." };
  }
  if (!v.number) {
    throw { code: null, message: "La contraseña debe incluir al menos 1 número." };
  }
  if (!v.special) {
    throw { code: null, message: "La contraseña debe incluir al menos 1 carácter especial (!@#$...)." };
  }

  // Validar confirmación
  if (password !== confirm) {
    throw { code: null, message: "Las contraseñas no coinciden." };
  }

  // Crear cuenta en Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Guardar nombre completo en el perfil de Auth
  await updateProfile(cred.user, {
    displayName: `${nombre} ${apellido}`,
  });

  // Guardar datos extra en Firestore
  await setDoc(doc(db, "users", cred.user.uid), {
    nombre,
    apellido,
    pais,
    email,
    createdAt: Date.now(),
  });
}

function showNote(msg, isError) {
  const el       = document.getElementById("auth-note");
  el.textContent = msg;
  el.style.color = isError ? "#f87171" : "var(--color-primary)";
}
