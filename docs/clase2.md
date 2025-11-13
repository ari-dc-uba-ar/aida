# Clase 2 – Taller de Integración  

## Pasos  

### 1. Migrar de JavaScript a TypeScript  

- Agregamos los archivos de configuración necesarios para trabajar con TypeScript (`tsconfig.json`).  
- Ajustamos el proyecto para que el código fuente esté dentro de `src/` y se compile a `dist/`.  
- Renombramos los archivos `.js` a `.ts` y corregimos las importaciones.  
- Instalamos los tipos necesarios para Node.js (`@types/node`).  
- Verificamos la compilación corriendo `npx tsc` y luego ejecutamos el resultado con `node dist/cli.js`.  

---

### 2. Generar certificado para un alumno  

- Creamos un script que obtiene los datos de un alumno desde la base de datos.  
- Con esos datos generamos un **archivo HTML/PDF** representando un certificado de graduación.  
- El archivo incluye:  
  - Nombre y apellido del alumno.  
  - Título obtenido.  
  - Fecha de emisión del certificado.  
- El archivo generado se guarda en la carpeta `certificados/`.  
- Validamos que, al ejecutar el script, se cree un certificado correcto para un alumno elegido.  

---

## Conceptos  

### ¿Por qué TypeScript?  
- Aporta **tipado estático** que ayuda a detectar errores en tiempo de compilación.  
- Mejora la **legibilidad y mantenibilidad** del código en equipos grandes.  
- Nos prepara para un stack más cercano a lo que se usa en la industria.  

### Generación de certificados  
- Es un primer acercamiento a la **capa de presentación** (outputs que consume el usuario final).  
- Sirve para ejercitar la conexión entre la base de datos y un formato de salida.  
- Más adelante se puede escalar a **generación de certificados en lote** o incluso a **descarga vía backend**.  

---

⚡ **Para la clase 2 trabajamos en:**  
1. Migrar a TypeScript con configuración básica.  
2. Generar un certificado para un alumno a partir de la base de datos.  
