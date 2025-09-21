# Clase 4. POLAR: Proceso Orquestador de Lotes Asincrónicos y Reportes

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
- El formato de cada fila debe **respetar las reglas ya definidas en la clase anterior** (es decir, permitir identificar si se trata de un pedido por **lu**, por **fecha** o por carga masiva desde un archivo).
- El sistema deberá poder procesar varias peticiones en lote en un mismo archivo.

De este modo, el flujo de trabajo se vuelve más natural para los usuarios que prefieren editar un archivo en lugar de tipear comandos complejos.

## Reglas generales

- El archivo `generacion_certificados.csv` se buscará en la carpeta de trabajo del sistema.
- Cada fila debe tener un campo que indique el **tipo de operación** (`lu`, `fecha`, `archivo`) y los parámetros correspondientes.
- El sistema procesará secuencialmente las filas:
  - Si alguna fila es inválida, deberá registrarse el error sin interrumpir las demás.
- Habrá una `carpeta_base` (configurable en el servidor) que tendrá dos subcarpetas `entrada` y `salida`
  - En la carpeta _entrada_ se encontrará la `generacion_certificados.csv` y el o los archivos mencionados en el comando `archivo`
  - En la carpeta _salida_ se generarán los certificados.

### Ejemplo de `generacion_certificados.csv`

```csv
tipo,parametro
archivo,alumnos.csv
fecha,2025-09-20
lu,1602/19
lu,1743/21
fecha,2025-09-22
```

# Desarrollo

## paso 1. Arreglar un error de la clase anterior: _Cambiar un `if` por un `while`_

En la clase 3 el `CLI` cuando recibía `--fecha dd/mm/yyyy`
debía generar los certificados de todos los alumnos que lo hubieran tramitado en esa fecha.
Sin embargo el programa solo devuelve el primero.

1. Vamos a corregir eso para que en lugar de un `if` haya un `while`.
Todo arranca en la función `obtenerAlumnoQueNecesitaCertificado`,
esa función debería devolver todos los alumnos que lo necesitaran, no uno solo.
O sea devuelve en vez de un alumno (o _null_ si no existe)
un array (y nos ahorramos el _null_, que no nos gusta).
2. Lo que de ahí se obtiene lo meto en un ciclo para generar todos los certificados.
No me ahorro el `if` si quiero mostrar un mensaje cuando no hay nada para generar.
3. Cambio los datos de ejemplo para que haya dos alumnos en la misma fecha
4. Cambio el nombre del certificado para que incluya la lu (y reemplazo la barra por una raya).

Instalo, compilo, seteo las variables de ambiente y genero 2 certificados de una fecha

```sh
> npm install
> npm run prepare
> recursos\local-sets.bat
> node dist/cli --archivo recursos/alumnos.csv --fecha 01/01/2022
```

## paso 2 prueba de concepto

Vamos a mirar la documentación de [Node.js para fs.watch](https://nodejs.org/docs/latest-v22.x/api/fs.html#fspromiseswatchfilename-options).
Activado el [event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)[^1]
_watch_ sirve para ejecutar un función cada vez que se modifique un archivo o una carpeta.

La prueba de contexto está en `poc-await.ts` y tiene lo mínimo, registrar un watcher y consumirlo asincrónicamente en un for

En una consola pongo
```sh
> mkdir local-carpeta-observada
> npm run prepare
> node dist/poc-watch
```
Y se quedará esperando para siempre e irá mostrando los cambios en la carpeta.

Podemos verificarlo abriendo otra consola y poniendo:
```sh
> copy .* local-carpeta-observada
> del local-carpeta-observada\.*
```

[^1]: Ojo en este artículo que habla de [run to completation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model#run-to-completion) que tiene una excepción respecto a las funciones [asincrónicas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), porque la sintaxis async/await es _sugar sintax_ de usar promesas. O sea cada await implica una función separada a partir de ahí.

## paso 3. Reordenar el código para separar la funcionalidad de la interface

Si queremos mantener la compatibilidad hacia atrás[^2]
vamos a necesitar que siga existiendo el cli (con sus comandos)
y tenemos que agregar el servidor que espera comandos dentro de la carpeta de entrada.

Eso va a significar tener dos archivos, el CLI y el POLER.
Ambos compartiran la funcionalidad común que la pondremos en otro u otros archivos según su función.

1. Dejamos en `cli.ts` solo que que es exclusivo del manejo de la línea de comandos. El resto lo movemos a otros archvios.
Miremos de abajo para arriba.
2. La función principal (que es la que arranca el CLI) y el parseador de parámetros quedan en `cli.ts`
3. Las funciones de generar certificados y cargar novedades de alumnos son el conocimiento específico del sistema
eso lo vamos a poner en `aida.ts`.
4. Los parámetros principales, si bien en principio parecen que son del CLI (son los parámetros `--archivo`, etc)
comparten el nombre y conocimiento de ser los comandos que se reciben en el archivo _.csv_
así que también los vamos a poner en `aida.ts`
5. `pasarAStringODarErrorComoCorresponda` es una función que puede servir indpendientemente si estamos en AIDA o no.
Tiene sentido que esté separado, veo que otras cosas tengo que sacar y decido agregar un archivo llamado
`tipos-atomicos.ts` que sepa convertir, parsear y tratar los tipos atómicos (los que pueden almacenarse en campos de la db).
Renombro esa función y la llamo `datoATexto` y paso también `sqlLiteral` y el tipo `DatoAtomico`.
6. `leerYParsearCsv` va a su propio archivo `csv.ts`, y probablemente haya que cambiar la implementación por una estándar más adelante.
7. Después del movimiento hay que agregar los `import` necesarios en cada archivo y
declarar `export` en las funciones que se necesitan en otros archivos; así empezamos a separar la implementación de la `API`.

Volvemos a probar y todo funciona como antes (pero ahora empieza a haber una separación del código).

[^2] y queremos, no solo por cuestiones didácticas, sino porque suele tener sentido.
En particular en este caso nos va a permitir reordenar el código de una manera que nos va a seguir sirviendo en adelante.