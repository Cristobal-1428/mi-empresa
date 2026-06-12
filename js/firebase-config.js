// ============================================================
//  CONFIGURACIÓN FIREBASE — StudioCP
//
//  PASOS PARA CONFIGURAR:
//  1. Ve a https://console.firebase.google.com
//  2. Crea un proyecto llamado "studiocp"
//  3. Agrega una app web (ícono </>)
//  4. Copia los valores del objeto firebaseConfig y pégalos abajo
//  5. En Firebase Console → Authentication → Sign-in method:
//       ✓ Habilita "Google"
//       ✓ Habilita "Correo electrónico/contraseña"
//  6. En Firebase Console → Firestore Database:
//       ✓ Crea una base de datos en modo producción
//       ✓ En la pestaña "Reglas", pega estas reglas:
//
//  rules_version = '2';
//  service cloud.firestore {
//    match /databases/{database}/documents {
//      match /clients/{docId} {
//        allow read: if request.auth != null;
//        allow write: if request.auth != null
//          && request.auth.token.email == "studiocp.fc@gmail.com";
//      }
//    }
//  }
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCnrJlAQbnVlLAygQ7g178H1fVFq5j86lA",
  authDomain:        "studio-cp-54c4f.firebaseapp.com",
  projectId:         "studio-cp-54c4f",
  storageBucket:     "studio-cp-54c4f.firebasestorage.app",
  messagingSenderId: "117331065288",
  appId:             "1:117331065288:web:5b0608459091cb045228fd",
};

const app = initializeApp(firebaseConfig);

export const auth        = getAuth(app);
export const db          = getFirestore(app);
export const ADMIN_EMAIL = "studiocp.fc@gmail.com";

// Convierte email en ID de documento (Firestore no permite . ni @)
// ej: "cliente@gmail.com" → "cliente-at-gmail-com"
export const emailToId = (email) =>
  email.toLowerCase().replace(/[@.]/g, (c) => c === "@" ? "-at-" : "-");
