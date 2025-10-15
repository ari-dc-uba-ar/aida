# Clase 6. Gestión de Alumnos

## Objetivo de la clase
Incorporar funcionalidades de **listado, ordenamiento y CRUD completo** (Create, Read, Update, Delete) sobre la entidad **Alumno**, integrando frontend y backend.

---

## Frontend

- Crear una nueva página en **`/app/alumnos`**.
- Esta página debe mostrar **todos los alumnos** con **todos los campos que existen en la base de datos**.
- La tabla debe permitir:
  - Ordenar por cada uno de los atributos.
  - Crear nuevos registros (formulario de alta).
  - Editar un alumno existente.
  - Borrar un alumno.

---

## Backend

- Disponibilizar un endpoint para **obtener todos los alumnos**.  
  - Método: `GET /api/alumnos`
- Disponibilizar un endpoint para **editar un alumno**.  
  - Método: `PUT /api/alumnos/:id`
- Disponibilizar un endpoint para **eliminar un alumno**.  
  - Método: `DELETE /api/alumnos/:id`
- Disponibilizar un endpoint para **crear un alumno**.  
  - Método: `POST /api/alumno`