# Control de Producción Automotriz (Demo)

Aplicación web de demostración para registrar y consultar la producción de una planta automotriz durante una jornada de trabajo. Permite capturar, por cada hora del turno, la cantidad de piezas conformes y las piezas no conformes (scrap).

## Funcionalidades

- Registro de piezas buenas y scrap en 8 franjas horarias.
- Selección de turno: mañana (07:00–15:00), tarde (15:00–23:00) y noche (23:00–07:00).
- Selección de línea de producción (Línea 01 a Línea 20), con registros independientes por línea.
- Resumen automático de piezas buenas, scrap, producción total y porcentaje de scrap.
- Edición y eliminación de registros por hora.
- Fecha de jornada asociada al turno; el turno nocturno considera el cambio de día.
- Guardado automático en el almacenamiento local del navegador (`localStorage`).
- Diseño adaptable a pantallas de escritorio y móviles.
- Confirmación antes de limpiar los registros de la jornada seleccionada.
- Registro de tipo de defecto asociado a cada hora de scrap para identificar la causa de la no conformidad.

## Cambios recientes

### 2026-10-12 — Tipo de defecto por hora

Se incorporó una nueva columna en el registro para indicar la causa del defecto cuando hay piezas no conformes. Las opciones disponibles son:

- Sin defecto
- Desalineación
- Rayado
- Soldadura
- Material defectuoso
- Ajuste de operación

Esto permite que el sistema no solo registre la cantidad, sino también la categoría del problema, lo que ayuda a detectar patrones de calidad por turno o línea.

## Ejecutar la demo

No requiere instalación de dependencias ni servidor. Abre `index.html` directamente en un navegador moderno. También puedes servir la carpeta con cualquier servidor web estático.

## Tecnologías

- HTML
- CSS
- JavaScript sin frameworks
- `localStorage` para conservar los registros en el dispositivo

## Git y control de versiones

El proyecto se trabaja en Git para llevar un historial de cambios. Cada mejora importante se recomienda guardar con un commit descriptivo.

Ejemplo:

```bash
git status
git add .
git commit -m "feat: agregar tipo de defecto al registro"
git push origin main
```

Si en algún momento quieres deshacer una mejora, puedes volver a una versión anterior con:

```bash
git log --oneline
```

Y luego:

```bash
git checkout <hash-del-commit>
```

O si ya quieres volver al estado actual de una rama remota:

```bash
git reset --hard HEAD~1
```

> Importante: usa `git reset --hard` con cuidado, porque borra cambios locales no guardados.

## Alcance y limitaciones

Esta versión es únicamente una demo de interfaz y funcionamiento local. No incluye backend, base de datos central, inicio de sesión, permisos, exportación ni sincronización entre dispositivos. Los datos pertenecen al navegador y dispositivo donde se capturan; limpiar los datos del navegador puede eliminarlos. La opción **Finalizar y limpiar jornada** elimina los registros del turno y fecha seleccionados en ese dispositivo.
