# Clase 5. API REST y Frontend Web

24/9/2025 – 17hs – Aula 1101

## Objetivo de la clase:

Avanzar hacia una arquitectura basada en **API REST**, ya que se necesita generar certificados desde distintas sedes y no todas tienen acceso directo a las carpetas que el *poller* monitorea.

El objetivo es diseñar un esquema cliente-servidor donde el **frontend** ofrezca páginas simples de interacción y el **backend** exponga endpoints REST que permitan realizar las operaciones necesarias.

## Necesidades del Producto

Hasta ahora, las funcionalidades estaban disponibles mediante el CLI y el POLAR. Sin embargo, esto implica compartir carpetas de red, lo cual no es posible en todas las sedes.

Para resolverlo, introducimos una API REST con dos capas:

- **Frontend (interfaz web mínima):**
  - `GET /menu` → muestra las opciones disponibles.
  - `GET /app/lu` → página para ingresar una LU y obtener el certificado.
  - `GET /app/fecha/` → página para ingresar una fecha y generar los certificados correspondientes.
  - `GET /app/archivo` → página para subir un archivo CSV y cargar los datos de los alumnos.

- **Backend (API REST):**
  - `GET /api/v0/lu/:lu` → devuelve el certificado para la LU indicada.
  - `GET /api/v0/fecha/:fecha` → devuelve los certificados de una fecha.
  - `PATCH /api/v0/archivo` → recibe un JSON con los datos de alumnos y los incorpora a la base.

### Consideraciones importantes

1. El **frontend** debe transformar el CSV que sube el usuario a un **JSON** antes de enviarlo al backend.
2. El **backend** debe leer y procesar datos en formato JSON (además del CSV que ya soportaba).
3. Cada grupo puede **definir el formato del JSON** que desee usar, siempre que:
   - sea consistente,
   - esté documentado,
   - y permita representar los datos de los alumnos de manera completa.
4. Se debe mantener la **retrocompatibilidad**. Los endpoints REST deben coexistir con el mecanismo anterior del POLAR y el CLI.
5. El frontend debe mostrar páginas HTML simples para interactuar con cada endpoint.
6. Los errores deben devolverse con mensajes claros tanto en la interfaz web como en el API (ej: LU inexistente, fecha inválida, CSV mal formado).

# Desarrollo

## paso 1. Utilizando los datos del orquestador para generar el FE y el BE

La demo de presentación de la case estaba escrita toda en duro.
Repitiendo mucho código y desperdigando el conocimiento de la estructura del sistema por todos lados.

En `aida.ts` habíamos puesto la información de las operaciones que podía hacer el sitema (en `operacionesAida`).
De ahí se puede deducir el menú, generar todos los endpoints en el backend
y dibujar alguna de las pantallas.

Sabemos que todas las pantallas no son iguales, ni los endpoints tienen el mismo comportamiento.
Para el comportamiento ya tenemos la acción a realizar, pero todavía se puede mejorar.

Empezamos con un ejemplo. No todas las acciones las queremos en el menú:
agregamos `visible:boolean` a la definición de operaciones.

## paso 2. Mejorando los parámetros

Todavía hay muchas cosas para mejorar.
Antes en la pantalla que se pedía una fecha se utilizaba un campo de tipo fecha.
Además los labels de los parámetros tenían un nombre largo (fecha del trámite)
y ahora el nombre del campo (titulo_en_tramite) que puede ser bastante confuso.

Corrijamos ambas cosas.
Para eso cada operación debería indicar cuáles son sus parámetros y de qué tipo.
Luego hay que comportarse en función de eso.