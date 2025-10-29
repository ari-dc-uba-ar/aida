## 📦 Concepto: Migraciones de Base de Datos

En todo proyecto real, las bases de datos **cambian con el tiempo**.  
Se agregan tablas, se renombran columnas, se modifican tipos de datos o se incorporan nuevos índices.  
El problema es que **no basta con hacerlo a mano**: el sistema debe saber **cuándo y cómo** se aplicaron esos cambios.

Ahí entra el concepto de **migraciones**.

---

### 🧠 ¿Qué es una migración?

Una **migración** es un **archivo que describe un cambio estructural** en la base de datos (por ejemplo, crear una tabla, agregar una columna o modificar una restricción).  
El objetivo es que esos cambios puedan:

- 📋 **Registrarse** (quién, cuándo y qué se cambió).  
- 🔄 **Reproducirse** de forma automática en distintos entornos (local, staging, producción).  
- 🧯 **Revertirse** fácilmente si algo sale mal.  

En otras palabras, una migración es como un **“commit” de la base de datos**.

---

### ⚙️ Ejemplo simple

Supongamos que en AIDA queremos agregar una nueva columna para guardar la fecha de nacimiento del alumno.

La migración podría verse así:

```sql
-- 2025_10_29_add_fecha_nacimiento_to_alumnos.sql

ALTER TABLE aida.alumnos
ADD COLUMN fecha_nacimiento DATE;