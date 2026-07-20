# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

## [1.0.0] — 2026-07-20

Primera versión estable del ANEFI Signature Generator. Lista para uso interno de Recursos Humanos.

### Incluye

- Formulario con los campos Nombre, Cargo, Área (opcional), Correo electrónico y Teléfono/Extensión (opcional).
- Vista previa de la firma que se actualiza en tiempo real mientras se escribe, sin necesidad de botones.
- Firma corporativa generada en HTML/CSS real (sin imágenes de texto), replicando de forma exacta el diseño oficial ANEFI: logo, nombre, cargo, área, correo y teléfono, con divisor vertical que se ajusta automáticamente a la cantidad de líneas presentes.
- Botón **Generar Firma** para refrescar la vista previa manualmente.
- Botón **Restablecer** para limpiar el formulario y la vista previa.
- Botón **Descargar PNG**, con exportación en alta resolución mediante la librería `html-to-image` (vendorizada localmente, sin dependencia de ningún CDN).
- Escala de exportación ajustable mediante una única constante (`EXPORT_SCALE`).
- Manejo seguro del correo electrónico en la firma (inserción vía DOM, sin `innerHTML`), evitando cualquier riesgo de romper el HTML con caracteres especiales.
- Manejo de errores de exportación con mensajes de diagnóstico legibles.
- Interfaz con etiquetas asociadas correctamente a cada campo, `autocomplete` apropiado por campo, y buen contraste de color.
- Proyecto pensado para ejecutarse con Live Server (VS Code) sobre `http://localhost`.

### Notas de la versión

- El único recurso gráfico de la firma es el logo oficial (`assets/logo.png`); todo lo demás es texto dinámico.
- Sin frameworks, sin paso de compilación, sin backend.
