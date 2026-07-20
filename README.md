# ANEFI Signature Generator

Herramienta interna de Recursos Humanos para generar firmas de correo corporativas de ANEFI. El usuario completa un formulario y la firma se actualiza en tiempo real, lista para copiar o exportar como imagen PNG en alta resolución.

Aplicación 100% HTML, CSS y JavaScript vanilla — sin frameworks, sin paso de compilación (build) y sin backend.

---

## Requisitos

- Un navegador moderno. **Se recomienda Google Chrome.**
- [Visual Studio Code](https://code.visualstudio.com/) con la extensión **Live Server** (de Ritwick Dey).
- No se necesita Node.js, npm, ni ninguna instalación adicional para usar la aplicación — todas las dependencias (incluida la librería `html-to-image`) ya están incluidas dentro del proyecto, en `assets/vendor/`.

> **Nota:** el proyecto está pensado para ejecutarse siempre a través de Live Server (`http://localhost:...`), no abriendo `index.html` directamente por doble clic. Esto es lo que permite que la exportación a PNG funcione de forma simple y confiable.

---

## Cómo abrir el proyecto

1. Descomprime el archivo `.zip` en cualquier carpeta de tu computadora.
2. Abre esa carpeta (`ANEFI Signature Generator`) con Visual Studio Code:
   - `Archivo → Abrir carpeta...` y selecciona la carpeta del proyecto.

## Cómo ejecutar Live Server

1. Si no la tienes instalada, instala la extensión **Live Server** desde el panel de extensiones de VS Code (ícono de cuadraditos en la barra lateral, buscar "Live Server").
2. En el panel de archivos de VS Code, haz clic derecho sobre `index.html`.
3. Selecciona **"Open with Live Server"**.
4. Se abrirá automáticamente tu navegador en una dirección como `http://127.0.0.1:5500` (el número de puerto puede variar) mostrando la aplicación funcionando.
5. Para detenerlo, haz clic en **"Port: 5500"** en la barra inferior de VS Code, o cierra la pestaña y da clic en "Stop Server".

---

## Cómo usar la aplicación

La pantalla tiene dos columnas:

**Izquierda — Formulario**
| Campo | Obligatorio | Notas |
|---|---|---|
| Nombre | Sí | Nombre completo tal como debe aparecer en la firma |
| Cargo | Sí | Puesto o rol |
| Área | No | Se omite en la firma si se deja vacío |
| Correo electrónico | Sí | Se muestra como enlace `mailto:` |
| Teléfono / Extensión | No | Se omite en la firma si se deja vacío |

**Derecha — Vista previa**
La firma se actualiza automáticamente mientras se escribe, sin necesidad de presionar ningún botón.

**Botones**
- **Generar Firma** — refresca la vista previa manualmente (la actualización en tiempo real ya lo hace, este botón sirve como confirmación explícita).
- **Restablecer** — limpia todos los campos del formulario y la vista previa.
- **Descargar PNG** — exporta la firma actual como imagen PNG en alta resolución (ver más abajo) y la descarga al equipo.

### Cambiar la calidad de la imagen exportada

En `script.js`, cerca del inicio del archivo:

```js
const EXPORT_SCALE = 3;
```

Ese número multiplica la resolución del PNG exportado (3 = el triple de resolución respecto al tamaño en pantalla). Para exportar en mayor o menor calidad, basta con cambiar ese valor — el resto del código lo usa automáticamente.

### Actualizar el logo

El logo se carga desde `assets/logo.png`. Si la identidad visual de ANEFI cambia, basta con reemplazar ese archivo (manteniendo el mismo nombre) — no hace falta tocar ningún código.

---

## Estructura del proyecto

```
ANEFI Signature Generator/
├── index.html                    Estructura de la aplicación (formulario + vista previa)
├── style.css                     Estilos de la interfaz y de la firma
├── script.js                     Lógica: render en tiempo real, botones, exportación PNG
├── README.md                     Este archivo
├── CHANGELOG.md                  Historial de versiones
└── assets/
    ├── logo.png                  Logotipo oficial ANEFI (único recurso gráfico de la firma)
    ├── fonts/                    Reservada para tipografías corporativas futuras (vacía por ahora)
    └── vendor/
        └── html-to-image.min.js  Librería de exportación a PNG (vendorizada, sin CDN)
```

---

## Notas técnicas

- La firma se genera en HTML/CSS real (una tabla, para máxima compatibilidad si en el futuro se copia y pega en Gmail/Outlook) — no es una imagen ni una plantilla estática. Todos los datos del formulario son dinámicos.
- La exportación a PNG usa la librería [html-to-image](https://github.com/bubkoo/html-to-image) (MIT License), incluida localmente en `assets/vendor/` — no se descarga de ningún CDN.
- El correo se inserta en la firma mediante el DOM (no `innerHTML`), por lo que cualquier carácter especial que se escriba en el formulario se muestra de forma segura, sin riesgo de romper el HTML de la firma.
