# Control de Producción Automotriz (Demo)

Aplicación web de demostración para registrar y consultar la producción de una planta automotriz durante una jornada de trabajo. Permite capturar, por cada hora del turno, la cantidad de piezas conformes y las piezas no conformes (scrap).

## Funcionalidades

- Registro de piezas buenas y scrap en 8 franjas horarias.
- Selección de turno: mañana (07:00–15:00), tarde (15:00–23:00) y noche (23:00–07:00).
- Resumen automático de piezas buenas, scrap, producción total y porcentaje de scrap.
- Edición y eliminación de registros por hora.
- Fecha de jornada asociada al turno; el turno nocturno considera el cambio de día.
- Guardado automático en el almacenamiento local del navegador (`localStorage`).
- Diseño adaptable a pantallas de escritorio y móviles.
- Confirmación antes de limpiar los registros de la jornada seleccionada.

## Ejecutar la demo

No requiere instalación de dependencias ni servidor. Abre `index.html` directamente en un navegador moderno. También puedes servir la carpeta con cualquier servidor web estático.

## Tecnologías

- HTML
- CSS
- JavaScript sin frameworks
- `localStorage` para conservar los registros en el dispositivo

## Alcance y limitaciones

Esta versión es únicamente una demo de interfaz y funcionamiento local. No incluye backend, base de datos central, inicio de sesión, permisos, exportación ni sincronización entre dispositivos. Los datos pertenecen al navegador y dispositivo donde se capturan; limpiar los datos del navegador puede eliminarlos. La opción **Finalizar y limpiar jornada** elimina los registros del turno y fecha seleccionados en ese dispositivo.
