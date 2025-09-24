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
