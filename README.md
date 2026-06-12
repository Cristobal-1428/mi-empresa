# Mi Empresa — Sitio web

Sitio web estático (HTML + CSS + JavaScript), sin dependencias ni paso de compilación.
Pensado para abrir y editar directamente en **VS Code**.

## Estructura

```
mi-empresa/
├── index.html        ← Página principal (estructura y contenido)
├── css/
│   └── styles.css    ← Estilos. Las VARIABLES de arriba controlan colores y tipografías
├── js/
│   └── main.js       ← Interacciones (menú móvil, formulario, año automático)
├── assets/
│   └── images/       ← Aquí van logos, fotos e imágenes
├── .gitignore
└── README.md
```

## Cómo verlo en el navegador

**Opción recomendada (VS Code):**
1. Abre la carpeta `mi-empresa` en VS Code (`Archivo → Abrir carpeta`).
2. Instala la extensión **Live Server** (busca "Live Server" en la pestaña de extensiones).
3. Haz clic derecho sobre `index.html` → **Open with Live Server**.
4. Se abrirá en tu navegador y se recargará solo cada vez que guardes un cambio.

**Opción simple:** haz doble clic en `index.html` para abrirlo en el navegador
(funciona, pero sin recarga automática).

## Cómo personalizarlo

- **Colores y tipografías:** edita las variables al inicio de `css/styles.css` (sección `:root`).
- **Textos:** edita directamente `index.html` (busca los textos placeholder).
- **Imágenes:** ponlas en `assets/images/` y enlázalas con `assets/images/nombre.jpg`.

## Pendientes para más adelante

- [ ] Definir nombre, logo, colores y tipografías de la marca
- [ ] Reemplazar todos los textos placeholder por contenido real
- [ ] Conectar el formulario de contacto a un servicio real de correo
- [ ] Añadir imágenes propias
- [ ] Configurar dominio y publicación (hosting)
