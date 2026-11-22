# Vórtex Clipboard

**Tu portapapeles, sin límites.** Historial de portapapeles y snippets de texto, de Vortex Company.

## Características

- **Historial**: captura lo que copias con `Ctrl+V` dentro de la app (sin permisos) o con el botón *Leer portapapeles* (Clipboard API con permiso del navegador). Dedupe consecutivo y límite de 300 entradas.
- **Fijar**: los textos fijados no se borran al vaciar el historial y siempre quedan arriba.
- **Snippets**: guarda los textos que usas a diario (correo de soporte, dirección, respuestas típicas) con nombre, color y edición; un clic copia el snippet.
- **Guardar como snippet** desde cualquier elemento del historial.
- Búsqueda instantánea, tiempos relativos (hace 2 min…), recuento de caracteres y estadísticas.
- Todo en `localStorage`: cero nube, cero cuentas.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Clipboard API · lucide-react.

## Notas del navegador

- `Ctrl+V` dentro de la página funciona en cualquier navegador moderno y no requiere permiso.
- *Leer portapapeles* requiere permiso del navegador y contexto seguro (HTTPS).
- *Clic para copiar* usa la API async del portapapeles con respuesta visual.

## Despliegue

Despliega directo en Vercel: no requiere variables de entorno.

## Desarrollo

```bash
bun install
bun run dev     # http://localhost:3000
bun run build
bun run lint
```

---

Derechos Reservados © 2026 Vortex Company · soporte: vortexmusic.soporte.app@gmail.com · Gratis · Sin anuncios
