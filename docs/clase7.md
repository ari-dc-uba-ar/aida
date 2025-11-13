# Clase 7. Sistema de Autenticación y Seguridad


## Necesidad de Negocio

En la última semana detectamos una vulnerabilidad en el sistema AIDA: se generaron certificados de manera no autorizada, lo que indica que terceros lograron acceder. Esto evidenció una falta de mecanismos de control y nos obliga a reforzar la seguridad del sistema para evitar accesos indebidos y preservar la integridad de la información.

A partir de este incidente, surge la necesidad de incorporar un sistema de autenticación robusto, que garantice que solo los usuarios registrados y autorizados puedan acceder a las funcionalidades.

## Objetivo de la clase
Implementar un **sistema de autenticación completo** con login, sesiones persistentes y protección de rutas para asegurar que solo usuarios autorizados puedan acceder al sistema AIDA.


## Pasos

### Crear tabla de usuarios
- Los campos mas alla de username y password_hash son a modo ilustrativo, pueden decidir si tenerlo o no.
```sql
CREATE TABLE aida.usuarios (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT,
    email TEXT,
); 
```

### Crear a un usuario 

```
curl -X POST http://localhost:<PORT>/api/v0/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","nombre":"Administrador","email":"admin@aida.com"}'
```

### Instalar nuevas dependencias/ paquetes en el proyecto 

- bcrypt: Para hashear y verificar contraseñas de forma segura
- express-session: Para manejar sesiones de usuario
- @types/bcrypt y @types/express-session: Tipos de TypeScript

```
npm install bcrypt express-session
npm install --save-dev @types/bcrypt @types/express-session
```

### Crear funcionalidades de autenticación en un nuevo modulo en src/auth (entregarles ese archivo)


```
hashPassword(password: string): Hashea una contraseña usando bcrypt.

verifyPassword(password: string, hash: string): Verifica una contraseña contra su hash

autenticarUsuario(client, username, password): Valida credenciales y retorna el usuario

crearUsuario(client, username, password, nombre?, email?): Crea un nuevo usuario
```


### Configuración de sesiones

- Ahora tenemos que modificar nuestro servidor para que los usuarios se logeen y restringirles el acceso. Trabajemos sobre servidor.ts


1. Imports necesarios
```
import session, { SessionData } from 'express-session';
import { autenticarUsuario, crearUsuario, Usuario } from './auth.js';
import { Request, Response, NextFunction } from "express"; 
import * as fs from 'fs'; // si no lo tenés
```

2. Extender los tipos de sesión 
```
declare module 'express-session' {
    interface SessionData {
        usuario?: Usuario;
    }
}
```

3. Configurar middlewares
- Un middleware en un endpoint es una función intermedia que se ejecuta antes de que el endpoint principal responda. Su objetivo es hacer tareas comunes, sin tener que repetir ese código en cada endpoint.

```
// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'cambiar_este_secreto_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));


*/
Aca arriba se esta usando un Middleware del paquete express-session. 

Este middleware crea una Cookie con un identificador único en base a el secreto que configurado. Guarda en el servidor la información asociada a esa sesión (por ejemplo, quién está logueado). Permite que entre requests, el servidor recuerde datos del mismo usuario.

Este se va a guardar por 1 día.
/*



// Middleware de autenticación para el frontend
function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/app/login');
    }
}

// Middleware de autenticación para el backend
function requireAuthAPI(req: Request, res: Response, next: NextFunction) {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
}


*/
Aca arriba se estan implementando dos funciones nuevas que van a tener la funcion de ser  Middlewares. 

Estos chequean si en la request se esta enviando session.usuario en la Cookie.
/*

```

### Agregar endpoints de autenticacion

```
// Página de login
app.get('/app/login', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/app/menu');
    }
    const loginHtml = fs.readFileSync('./src/views/login.html', 'utf8');
    res.send(loginHtml);
});

// API de login
app.post('/api/v0/auth/login', express.json(), async (req, res) => {
     ....
});

// API de logout
app.post('/api/v0/auth/logout', (req, res) => {
     ... 
});


// API de registro
app.post('/api/v0/auth/register', express.json(), async (req, res) => {
    ...
});
```

### Agregar la pagina HTML para el login
- 

### Proteger rutas existentes

- Necesitamos agregar el Middleware para que efectivamente se protega nuestra aplicación

```
// En el frontend Agregamos el middleware que nos lleva a poner usuario y contraseña.
app.get('/app/alumnos', **requireAuth**, async (req, res) => { ... });

// En el backend Agregamos el middleware que devuelve 401 si no esta autenticado.
app.get('/api/v0/alumnos', **requireAuthAPI**, async (req, res) => { ... })


Nota: Para los endpoints que contengan body (PUT,DELETE,POST) puede que necesiten utilizar otro middleware nativo "express.json()"
```