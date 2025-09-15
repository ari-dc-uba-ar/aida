# Clase 4

17/9/2025 – 17hs – Aula 1101

## Objetivo de la clase:

Mejorar la experiencia de uso del sistema introduciendo un nuevo mecanismo de interacción:  
en lugar de depender únicamente de la terminal y de sus parámetros, los pedidos de certificados deberan cargarse en un archivo `generacion_certificados.csv`.  

El programa deberá escuchar los cambios en este archivo, interpretar las peticiones y generar los certificados correspondientes.

## Necesidades del Producto

En las primeras versiones, la herramienta funcionaba bien con parámetros de línea de comandos. Sin embargo, los usuarios manifestaron que **no les resultaba cómodo trabajar directamente desde la terminal**.  

Para responder a esta necesidad, vamos a introducir una nueva forma de uso basada en un archivo de solicitudes:

- El archivo se llamará **`generacion_certificados.csv`**.
- Cada fila representará una petición de generación de certificados.
- El formato de cada fila debe **respetar las reglas ya definidas en la clase anterior** (es decir, permitir identificar si se trata de un pedido por **LU**, por **fecha** o por carga masiva desde un archivo).
- El sistema deberá poder procesar varias peticiones en lote en un mismo archivo.

De este modo, el flujo de trabajo se vuelve más natural para los usuarios que prefieren editar un archivo en lugar de tipear comandos complejos.

## Reglas generales

- El archivo `generacion_certificados.csv` se buscará en la carpeta de trabajo del sistema.
- Cada fila debe tener un campo que indique el **tipo de operación** (`LU`, `FECHA`, `ARCHIVO`) y los parámetros correspondientes.
- El sistema procesará secuencialmente las filas:
  - Si alguna fila es inválida, deberá registrarse el error sin interrumpir las demás.


### Ejemplo de `generacion_certificados.csv`

```csv
tipo,parametro
ARCHIVO,recursos/alumnos.csv
FECHA,2025-09-20
LU,1602/19
LU,1743/21
FECHA,2025-09-22
