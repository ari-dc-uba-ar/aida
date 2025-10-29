
# Clase 9. Integración con Base Productiva (Supabase)

## 🎯 Objetivo de la clase

Conectar el sistema **AIDA** a una **base de datos productiva en la nube** usando **Supabase**
Aprenderemos a:

---

## 1.  Crear la base productiva en Supabase

1. Ir a [https://supabase.com](https://supabase.com)
2. Iniciar sesión con **“Continue with GitHub”**  
3. Crear una nueva base de datos replicando el schema y tablas de su base Local para que quede con la misma estructura. No es necesario que populen los datos especificos de cada tabla. Ej: que tengan los mismos alumnos.

---

## 2. Volver a crear Usuarios con permisos para poder usar la aplicacion 

Desde el panel de Supabase → pestaña **SQL Editor**  pueden ejecutar queries.

```sql
CREATE USER aida_user WITH PASSWORD 'aida123';

-- Dar acceso al schema
GRANT USAGE ON SCHEMA aida TO aida_user;

-- Dar permisos sobre tablas actuales
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA aida TO aida_user;

-- Dar permisos por defecto sobre tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA aida
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO aida_user;

```

## 3.  Adaptar código para elegir que DB usar
- Dentro del apartado **Connect** en la parte superior de la pantalla obtener el *Connection String*. 
- Cambiar el código de nuestra aplicacion  para conectarse a el nuevo cliente

    const clientDb = new Client({
    connectionString: process.env.DATABASE_URL
    })

- Según si se este trabajando en "Local" o en "Produccion" se debera usar conectar de esta nueva forma o la anterior. Esto leerse de una variable de ambiente en un archivo .env

## 4.  Verificar que nuestra aplicación sigue con la DB Productiva :) 

1.  Crear un nuevo Usuario para que pueda logearse

    curl -X POST http://localhost:5000/api/v0/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123","nombre":"Administrador","email":"admin@aida.com"}'
    {"success":true,"usuario":{"username":"admin","nombre":"Administrador"}}%

2. Entrar a la página y hacer pruebas manuales


