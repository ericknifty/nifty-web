# WEB Imposición MVP

MVP inicial para una app web de imposiciones y montaje de tarjetas o piezas gráficas.

## Qué hace hoy

- Carga un archivo fuente en formato PDF o imagen.
- Detecta tamaño de página para PDFs.
- Detecta tamaño de imagen en píxeles y estima el tamaño físico usando DPI.
- Permite editar ancho y alto de la pieza con proporción bloqueada o libre.
- Permite elegir una página concreta cuando el PDF es multipágina.
- Permite elegir hoja de salida, margen, separación, filas y columnas.
- Incluye botón `Llenar página` para calcular la grilla máxima sin rotación.
- Dibuja vista previa con `corte simple` y `corte doble`.
- Exporta un PDF básico rasterizado con la imposición actual.

## Supuestos del MVP

- Las medidas editables de la pieza representan el tamaño final de corte.
- En `corte doble`, el bleed se suma por fuera de ese tamaño final.
- No hay rotación automática de piezas.
- Se trabaja con una sola fuente a la vez.
- La exportación actual rasteriza la hoja completa; más adelante conviene migrarla a una salida vectorial.

## Cómo abrirlo

1. Abre [index.html](C:\Users\grafi\OneDrive\Documentos\Erick\WEB Imposicion\index.html) en un navegador moderno.
2. Para manejo de PDFs y exportación PDF, el navegador necesita acceso a internet porque el MVP carga `pdf.js` y `jsPDF` desde CDN.

## Próximos pasos recomendados

1. Distinguir entre `tamaño final` y `tamaño del archivo con bleed`.
2. Agregar rotación automática para optimizar cabida.
3. Soportar varios archivos o varias páginas en un mismo trabajo.
4. Migrar el motor de salida a PDF vectorial con marcas más precisas.
5. Pasar esta base a React o Next.js cuando validemos el flujo de negocio.
