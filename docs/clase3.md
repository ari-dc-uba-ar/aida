# Clase 1

20/8/2025 – 17hs – Aula 1101

# CLI con parámetros

**En esta clase, los alumnos intentaron resolver por sí mismos la siguiente consigna.**.
Al final estará la resolución de la cátedra, paso a paso, commit a commit.

## Objetivo de la clase:

Enriquecer el CLI para soportar tres modos de uso: carga de datos desde planilla (ya implementado), emisión de constancias por fecha y emisión de constancia por LU. Cada modo refleja una necesidad concreta: la carga masiva en secretaría, los reportes díarios y la atención al alumno en ventanilla.

## Necesidades del Producto

Nuestro jefe esta muy contento con este MVP de la herramienta y busca darle más utilidad.

En **secretaría** se trabaja con las planillas que llegan de forma mensual. El interés es poder cargar los nuevos valores en la base, sin borrar los valores anteriores como se estaba haciendo hasta ahora. De ahí surge el **modo carga**, que toma el CSV y actualiza la tabla de alumnos.

En la **dirección**, en cambio, suele pedirse generarse todas las constancias del fecha. Para eso sirve el **modo fecha**, que recibe un día y genera todos los certificados correspondientes a esa fecha, dejándolos listos en la carpeta de salida.

Finalmente, en **ventanilla**, un alumno puede pedir su constancia puntual. Para eso está el **modo LU**, que recibe la libreta universitaria y genera el certificado correspondiente, siempre que los datos estén completos.

## Reglas generales y parámetros

- **Modo carga**
  - Parámetros: `--archivo <ruta_al_archivo_csv>`
  - Resultado: se refresca la tabla de alumnos con el contenido del CSV.

- **Modo fecha**
  - Parámetros: `--fecha <YYYY-MM-DD>`
  - Resultado: Genera los certificados con la fecha de tramite pedida

- **Modo LU**
  - Parámetros: `--lu <identificador>`
  - Resultado: genera un certificado para el alumno con la LU indicada o informa si no es posible.

En todos los casos, si falta un parámetro obligatorio o su formato es inválido, el programa debe mostrar un mensaje de error con ejemplos de uso. Si no se indica ningún modo, se puede mostrar la ayuda general o mantener el comportamiento actual como alias del modo carga.

**Si no se especifica ningún modo, el programa debe fallar e informar sobre que es necesario el uso de un modo.**

# Resolución de la cátedra, pasos

## 1. Reordenamiento del código

[](https://github.com/ari-dc-uba-ar/aida/commit/)

1. Antes de empezar a implementar la nueva funcionalidad tenemos que ver si podemos reordenar el código y que todo siga funcionando.
2. Hay una función llamada principal que ahora está haciendo dos cosas que vamos a necesitar:
   1. cargar las novedades y
   2. imprimir el certificado (aunque en este caso es solo el del primer alumno podemos suponer que agregar el filtro correcto a eso no debería ser un problema).
3. Separemos esa funcionalidad en dos funciones.
4. comprobemos que todos siga andando igual.

## 2. Procesamiento de parámetros

[](https://github.com/ari-dc-uba-ar/aida/commit/)

1. Hay 3 parámetros posibles, cada uno de los tres determinan una acción distinta
   (o dos, pero una de ellas con un filtro distinto: una fecha o una libreta universitaria)
2. Para mantener la compatibilidad hacia atrás agreguemos un parámetros más `--prueba-primero`
   que imprima el primero como hasta ahora.
3. Parsear los parámetros es simplemente recorrer la lista buscando un `--`,
   si la palabra que sigue no está en la lista de parámetros debe informarse,
   si no debe (salvo para `prueba-primero`) tomarse el valor del parámetro
   y correr la función correspondiente
4. Pero cuando uno empieza a programar la función que va a parsear los parámetros no todo es tan simple.
   Por un lado los primeros parámetros corresponden a la invocacion de _node_ y al propio comando _cli.ts_
   (y eso no está claro que no pueda ser de otro modo).
   Por otro lado no está dicho si se pueden escribir dos parémtros (ej `--archivo` seguido de `--fecha`)
   lo cual parecería lógico. Incluso poder usar dos fechas podría parecer útil.
   No parece descabellado (en el sentido de que no es más complicado de hacer)
   devolver una lista (arreglo) de los parámetros ya validados.
5. Armamos la función entonces devolviendo los parámetros encontrados en un arreglo que contiene
   un par de elementos `{parametro, argumentos}` por ejemplo `[{parametro: 'fecha', argumentos:['2025-08-27']}]`.
6. Como esto ya es mucho, simplemente vamos a mostrar por pantalla los parámetros.

Si lo corremos vemos:
```sh
> node src\cli.ts --archivo alumnos.csv --fecha 2025-09-20 --fecha 2025-09-22
Por procesar [
  { parametro: 'archivo', argumentos: [ 'alumnos.csv' ] },
  { parametro: 'fecha', argumentos: [ '2025-09-20' ] },
  { parametro: 'fecha', argumentos: [ '2025-09-22' ] }
]
```

Seguido de un error del que no nos vamos a ocupar en este paso.

## 3. Ejecución basada en parámetros

En este punto tenemos la lista de parámetros encontrados y
podemos iterarla para ejecutra lo que el usuario pide:
1. Escribo una función para ejecutar cada parámetro.
Ya tengo una para `archivo` y para `prueba-primero` las uso,
para las otras simplemente muestro un cartel de "no implementado aún".
2. En la definición de los paramtros del programa principal
agrego una propiedad para guardar la función que se va a ejecutar.
3. Recorro la lista de `{parametro, argumento}` llamanda a la función
correspndiente de a uno por vez.
4. De paso agregamos los tipos de todos los parámetros de las funciones.

Ejecuto
```sh
> node src\cli.ts --archivo recursos/alumnos.csv --prueba-primero
```
y obtengo la misma corrida que obtenía al principio de la clase
pero ahora en base a procesar los parámetros y eligiendo el nombre del csv.

## 4. Agregamos la función para `--lu`

Otra vez, antes de copiar y pegar hay que ver qué se puede reutilizar, reorganizar.
Ya hay una función que busca un alumno y genera el certificado.
Hay que buscar la forma de pasarle distintos tipos de parámetros a la función `generarCertificadoAlumno`.
O de indicarle si queremos uno o no (porque la función actual no recibe ninguno más que la conexión a la base de datos).
1. Definamos al filtro como un objeto que puede tener o bien una libreta o bien una fecha o una indicación de que es el de prueba.
Eso en _TypeScript_ se podría escribir así `type FiltroAlumnos = {fecha: Date} | {lu: string} | {uno: true}`.
2. La función cambia de nombre ya no es `obtenerPrimerAlumnoQueNecesitaCertificado` se va el cualificador
`Primer` (si quiero uno solo le paso `uno` como filtro).
La función ahora recibe el filtro y agrega en el _WHERE_ la libreta (o `LIMIT 1`, como antes, si quiere uno).
3. Como esa función necesita poner dentro del SQL el valor ingresado para el usuario
agregamos una función sqlLiteral, para manejar la **inyección de código** (tema que se va a ver en teórica también).
4. La función `generarCertificadoAlumno` también recibe un filtro que se lo pasa a `obtenerAlumnoQueNecesitaCertificado`.
A su vez generamos un par de funciones `generarCertificadoAlumnoPrueba` y `generarCertificadoAlumno`
que reciben los parámetros tal cual vienen de la línea de comandos y cada una arma el objeto filtro como corresponda.

Si ejecutamos:
```
> node src\cli.ts --archivo recursos/alumnos.csv --lu 1602/19
```
Vemos generarse el certificado de esa LU.

## 5. Agregamos la función para `--fecha`

### Manejo de fechas

Las fechas y el Javascript. Ya lo hablamos en clases.

Si bien Javascript (y TypeScript) tienen un tipo de datos llamado `Date`, en realida es un tipo _Date time_,
que si bien podría usarse para almacenar fechas (y se puede), por el tema de los timezones
(y los cambio de hora en verano e invierno), usar `Date` puede ser complicado y confuso.
Por ejemplo si almacenamos fechas en `Date` para la hora `00:00` (12 de la noche), tenemos que decidir
si ese almacenamiento es en la hora universal coordinada (_UTC_) o en la hora local (_GMT-3_ en Buenos Aires).
La desventaja de _UTC_ es que si uno tiene una fecha `d` no obtener el string de la fecha haciendo:
`d.getDate()+'/'+d.getMont()+'/'+d.getFullYear()`
(eso es por varias razones, la primera es que `getMonth` devuelve los meses entre 0 y 11, culpa de Kernighan & Ritchie,
la segunda es que esas funciones asumen que se quiere trabajar en la zona horaria local).
Si en cambio trabajamos en la hora local y consideramos que la fecha se almacena con a las 12 de la noche del timezone local,
el problema es que ya no se puede sumar 24hs (o su equivalente en milisegundos) para sumar un día
(y no hay una función nativa para sumar un día).

Una manera de tener paz con esto es empezar a diferenciar lo que queremos expresar (almacenar y usar fechas)
con los detalles de implementación (si usamos Date y cómo o un string o qué).
Estos detalles de implementación deberían encapsularse de modo que nadie utilice directamente un `Date`
aunque hayamos elegido que `Date` iba a ser la implementación de fecha.

Vamos a crear entonces un tipo abstracto de datos para eso. Las funciones que necesitamos son:
Convertores de:
* _string_ a _Fecha_ para la línea de comandos (querríamos que el usuario pueda cargar en _d/m/y_),
* _ISO-string_ a _Fecha_ para el intercambio de datos automáticos (ej _.CSV_),
* _Fecha_ a texto para humanos (o sea _dd/mm/yyyy_)
* _Fecha_ a _ISO-string_ (o sea yyyy-mm-dd para el _.CSV_)
Y también hay que ver cómo se trabaja con la base de datos.

Respecto a la base vemos que en la librería que estamos usando [node-postgres](https://github.com/brianc/node-pg-types)
hay una forma de manejar los tipos y cambiar el comportamiento.

Decidimos entonces que es más conveniente usar una implementación donde no necesitemos tocar [postgres-date](https://www.npmjs.com/package/postgres-date)
que almacena las fechas en un `Date` colocándolo las doce de la noche de la hora local.

1. Escribimos una prueba de concepto para verificar qeu entendimos bien cómo se generan los tipos de postgres con [node-postgres](https://node-postgres.com/).

