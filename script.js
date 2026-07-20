/* ============================================================
   ANEFI Signature Generator — script.js
   ------------------------------------------------------------
   Responsabilidades de este archivo:
     1. Configuración de la plantilla activa (logo, escala de
        exportación).
     2. Actualizar la firma en tiempo real mientras se escribe.
     3. Restablecer el formulario.
     4. Exportar la firma como PNG en alta resolución.

   Nada de esto simula datos: todo se lee directamente del
   formulario y se escribe directamente en el DOM de la firma.
   ============================================================ */

/* ------------------------------------------------------------
   1. CONFIGURACIÓN
   ------------------------------------------------------------
   SIGNATURE_TEMPLATE agrupa todo lo que depende de la marca.
   Hoy solo existe la plantilla "anefi", pero mantenerla como un
   objeto (en vez de valores sueltos repartidos por el código)
   deja el camino preparado para el día en que ANEFI necesite
   más de una plantilla (ej. distintas áreas o marcas): bastaría
   con definir un objeto adicional como este y un selector que
   decida cuál usar, sin tocar el resto de la lógica.
   ------------------------------------------------------------ */
const SIGNATURE_TEMPLATE = {
  id: "anefi",
  name: "ANEFI",
  // Ruta al logo dentro de /assets — debe coincidir con el src
  // del <img id="sig-logo"> en index.html. Se mantiene aquí como
  // referencia (y para cuando exista más de una plantilla).
  logoSrc: "assets/logo.png",
};

// Escala de renderizado para "Descargar PNG". 2 = retina estándar,
// 3 = alta resolución (impresión, pantallas de muy alta densidad).
// Cambiar solo esta constante ajusta la calidad de exportación
// en toda la función downloadSignatureAsPNG().
const EXPORT_SCALE = 3;

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Referencias del formulario ---------- */
  const form = document.getElementById("signature-form");
  const statusMsg = document.getElementById("status-msg");

  const fields = {
    nombre: document.getElementById("nombre"),
    cargo: document.getElementById("cargo"),
    area: document.getElementById("area"),
    email: document.getElementById("email"),
    telefono: document.getElementById("telefono"),
  };

  /* ---------- Referencias de la firma ---------- */
  const sig = {
    root: document.getElementById("signature"),
    nombre: document.getElementById("sig-nombre"),
    cargo: document.getElementById("sig-cargo"),
    area: document.getElementById("sig-area"),
    email: document.getElementById("sig-email"),
    telefono: document.getElementById("sig-telefono"),
  };

  // El logo ya viene cargado desde assets/logo.png en el propio
  // HTML (ver <img id="sig-logo" src="assets/logo.png">), así
  // que aquí no hace falta asignarlo por JavaScript.

  /* ------------------------------------------------------------
     2. RENDERIZADO EN TIEMPO REAL
     ------------------------------------------------------------ */

  /** Muestra u oculta una línea opcional de la firma según tenga
   *  contenido o no, evitando espacios vacíos. */
  function setOptionalLine(element, value){
    if (value){
      element.textContent = value;
      element.hidden = false;
    } else {
      element.hidden = true;
      element.textContent = "";
    }
  }

  /** Lee el formulario y actualiza la firma. Se llama en cada
   *  tecla (tiempo real) y también desde "Generar Firma". */
  function renderSignature(){
    const nombre = fields.nombre.value.trim();
    const cargo = fields.cargo.value.trim();
    const area = fields.area.value.trim();
    const email = fields.email.value.trim();
    const telefono = fields.telefono.value.trim();

    sig.nombre.textContent = nombre || "\u00A0";
    sig.cargo.textContent = cargo || "\u00A0";

    setOptionalLine(sig.area, area);

    // El enlace de correo se arma con el DOM (createElement +
    // propiedades), no con innerHTML. Así el valor del campo
    // nunca se interpreta como HTML, sin importar qué caracteres
    // contenga (comillas, símbolos, etc.) — no hace falta escapar
    // nada a mano ni arriesgarse a romper el atributo href.
    sig.email.textContent = "";
    if (email){
      const link = document.createElement("a");
      link.href = "mailto:" + email;
      link.textContent = email;
      sig.email.appendChild(link);
      sig.email.hidden = false;
    } else {
      sig.email.hidden = true;
    }

    setOptionalLine(sig.telefono, telefono);
  }

  let statusTimeout;
  function showStatus(msg){
    statusMsg.textContent = msg;
    if (msg){
      window.clearTimeout(statusTimeout);
      statusTimeout = window.setTimeout(() => { statusMsg.textContent = ""; }, 2500);
    }
  }

  // Actualización en tiempo real: cada campo dispara el render
  // en cuanto el usuario escribe, sin esperar a ningún botón.
  Object.values(fields).forEach(input => {
    input.addEventListener("input", renderSignature);
  });

  /* ------------------------------------------------------------
     3. BOTONES
     ------------------------------------------------------------ */

  document.getElementById("btn-generate").addEventListener("click", () => {
    renderSignature();
    showStatus("Firma generada.");
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    form.reset();
    renderSignature();
    showStatus("Formulario restablecido.");
  });

  document.getElementById("btn-download").addEventListener("click", () => {
    downloadSignatureAsPNG();
  });

  /* ------------------------------------------------------------
     4. EXPORTAR A PNG
     ------------------------------------------------------------
     La conversión de HTML a imagen la hace la librería html-to-image
     (vendorizada en assets/vendor/html-to-image.min.js) directamente
     sobre el elemento #signature. No hay SVG, foreignObject, XML ni
     serialización manual de por medio: de eso se encarga la
     librería, incluyendo la carga del logo — el proyecto se sirve
     con Live Server (http://localhost), así que no hace falta
     ningún tratamiento especial para el logo ni para nada más.
     ------------------------------------------------------------ */

  // Evita que dos exportaciones corran a la vez si el usuario
  // hace doble clic en "Descargar PNG" mientras la primera
  // todavía se está generando.
  let isExporting = false;

  /** Genera un nombre de archivo a partir del nombre ingresado. */
  function buildFileName(){
    const base = fields.nombre.value.trim() || "firma-anefi";
    return base
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "firma-anefi";
  }

  /** Registra el error tal cual en consola y arma una descripción
   *  legible para mostrarla en pantalla. Un fallo al exportar no
   *  siempre llega como un Error normal: si algo dentro de
   *  html-to-image falla al cargar una imagen internamente, lo que
   *  se recibe es un Event (el propio evento "error" del <img>),
   *  que no tiene ".message" — concatenarlo directo a un string da
   *  "[object Event]" y no dice nada. Por eso se inspecciona según
   *  el tipo real de lo que llegó. */
  function describeExportError(error){
    console.error("Error al exportar PNG:", error);

    if (typeof Event !== "undefined" && error instanceof Event){
      const target = error.target;
      const targetTag = target && target.tagName ? target.tagName.toLowerCase() : "?";
      const targetSrc = target && target.currentSrc ? target.currentSrc
        : target && target.src ? target.src
        : null;
      console.error("  tipo de evento:", error.type);
      console.error("  target:", target);
      console.error("  currentTarget:", error.currentTarget);
      return `no se pudo cargar un recurso interno (evento "${error.type}" en <${targetTag}>`
        + (targetSrc ? `, src: ${targetSrc.slice(0, 100)}${targetSrc.length > 100 ? "…" : ""}` : "")
        + ")";
    }

    const parts = [];
    if (error && error.message) parts.push(error.message);
    if (error && error.stack){
      console.error("  stack:", error.stack);
    }
    if (parts.length) return parts.join(" — ");

    return String(error);
  }

  async function downloadSignatureAsPNG(){
    if (isExporting) return;
    isExporting = true;

    try {
      const dataUrl = await htmlToImage.toPng(sig.root, {
        pixelRatio: EXPORT_SCALE,
        backgroundColor: "#ffffff",
        // La firma solo usa fuentes del sistema (Arial/Helvetica),
        // así que no hay nada que descargar ni incrustar aquí.
        // Se salta ese paso por completo: menos trabajo y una
        // fuente menos de posibles fallos.
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = `${buildFileName()}.png`;
      link.href = dataUrl;
      // Se agrega el enlace al documento antes del click: algunos
      // navegadores (Firefox) ignoran el click de un <a> que no
      // está en el DOM. Se retira justo después.
      document.body.appendChild(link);
      link.click();
      link.remove();
      showStatus(`PNG descargado (${EXPORT_SCALE}x).`);
    } catch (err) {
      // Se muestra el motivo real del error (y se deja también en
      // la consola, con más detalle) para poder diagnosticar sin
      // depender de que alguien abra las herramientas de
      // desarrollador.
      showStatus("No se pudo exportar el PNG: " + describeExportError(err));
    } finally {
      isExporting = false;
    }
  }

  /* ---------- Estado inicial ---------- */
  renderSignature();

});
