# Notas del MVP

## Flujo cubierto

1. Cargar PDF o imagen.
2. Detectar tamaño.
3. Elegir página si es PDF multipágina.
4. Editar tamaño final.
5. Definir hoja, margen, separación y grilla.
6. Cambiar entre corte simple y corte doble.
7. Llenar página.
8. Exportar PDF.

## Punto que dejé explícito para la siguiente iteración

Tu caso real probablemente va a necesitar distinguir estos dos escenarios:

- Archivo ya viene con bleed incluido.
- Archivo viene al tamaño final y la app debe sumar bleed para el montaje.

En este primer MVP implementé el segundo modelo porque permite avanzar rápido y probar el flujo general. Si quieres, la siguiente iteración la enfoco justo en esa diferencia para que el cálculo de `corte doble` refleje exactamente tu operación de imprenta.
