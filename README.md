# Control de Producción Automotriz (Demo)

Aplicación web de demostración para registrar y consultar la producción de una planta automotriz durante una jornada de trabajo. Permite capturar, por cada hora del turno, la cantidad de piezas conformes y las piezas no conformes (scrap).

## Avance del proyecto

- [x] **Paso 1 — Registro de producción:** turnos, fecha, 8 franjas por jornada, captura de piezas buenas y scrap, totales, edición, eliminación y guardado local.
- [x] **Paso 2 — Clasificación de scrap:** selección del tipo de defecto en cada hora, visible en la tabla y conservada al editar o recargar.
- [x] **Paso 3 — Análisis de turno:** resumen del rendimiento, desglose por defecto y comparación por hora para detectar tendencias de calidad.
- [x] **Paso 4 — Registro de paros:** captura de horarios, causa, responsable y detalle, con duración total por jornada.
- [x] **Paso 5 — Cumplimiento de meta:** seguimiento de piezas buenas contra una meta configurable por línea, fecha y turno, con resumen ejecutivo de defectos y paros.
- [x] **Mejora móvil:** campos numéricos y selector de defecto con controles grandes y diseño adaptable.

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
- Registro de paros de línea por jornada, con duración calculada, causa, responsable y detalle.
- Configuración de una meta de piezas buenas por jornada y visualización de avance, piezas faltantes y cumplimiento.
- Resumen ejecutivo con el defecto que más piezas scrap genera y la causa que acumula más tiempo de paro.

## Cambios recientes

### 2026-10-20 — Paso 5: cumplimiento de meta

Se agregó una meta editable de piezas buenas para cada combinación de línea, fecha y turno. El tablero muestra el porcentaje de cumplimiento, las piezas restantes o la cantidad que superó la meta, además de resumir el principal defecto y la causa de paro con mayor duración.

### 2026-10-16 — Paso 4: registro de paros

Se agregó un registro de paros independiente de la producción por hora. Cada evento guarda inicio, fin, causa, responsable y detalle; el resumen calcula la duración acumulada y conserva los datos por fecha, turno y línea.

### 2026-10-15 — Paso 3: análisis de turno

Se agregó un panel de análisis para cada jornada con:

- resumen general de producción y porcentaje de scrap,
- ranking de defectos más frecuentes,
- comparación visual por hora para detectar picos de calidad o scrap.

La información se calcula a partir de los datos ya registrados y se actualiza en tiempo real al editar o limpiar la jornada.

### 2026-10-14 — Paso 2: clasificación de scrap por hora

Cada franja horaria permite seleccionar la causa del scrap. Las opciones disponibles son:

- Sin defecto
- Desalineación
- Rayado
- Soldadura
- Material defectuoso
- Ajuste de operación

La categoría se guarda junto con las cantidades de la hora y permanece disponible al editar el registro.

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

Esta versión es únicamente una demo de interfaz y funcionamiento local. No incluye backend, base de datos central, inicio de sesión, permisos, exportación ni sincronización entre dispositivos. Los datos y metas pertenecen al navegador y dispositivo donde se capturan; limpiar los datos del navegador puede eliminarlos. La opción **Finalizar y limpiar jornada** elimina la producción, los paros y la meta del turno, fecha y línea seleccionados en ese dispositivo.
