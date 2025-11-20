
//import { DefinicionesDeOperaciones, orquestador } from './orquestador.js';
//import { operacionesAida, obtenerTodosLosAlumnos } from './aida.js';
import { autenticarUsuario, crearUsuario, Usuario } from './auth.js';
import * as fs from 'fs';
import session from 'express-session';
import express from 'express';
//import { Request, Response, NextFunction } from 'express';
import { Client } from "pg";

// ... otros imports


// Extender tipos de sesión para incluir usuario
declare module 'express-session' {
    interface SessionData {
        usuario?: Usuario;
    }
}

const app = express()



// ...

async function getDbClient() {
    const client = new Client();
    await client.connect();
    return client;
}


app.use(express.text({ type: 'text/csv', limit: '10mb' })); // para poder leer el body como texto plano

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'cambiar_este_secreto_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24  // 1 días
    }
}));



// ============= MIDDLEWARES =============

// Middleware para verificar autenticación en páginas HTML
/*function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/app/login');
    }
}

// Middleware para verificar autenticación en API (retorna JSON)
function requireAuthAPI(req: Request, res: Response, next: NextFunction) {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
}

*/
// ============= ENDPOINTS DE AUTENTICACIÓN =============

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
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const clientDb = await getDbClient();

    try {
        const usuario = await autenticarUsuario(clientDb, username, password);

        if (usuario) {
            req.session.usuario = usuario;
            return res.json({
                success: true,
                usuario: {
                    username: usuario.username,
                    nombre: usuario.nombre
                }
            });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    } finally {
        await clientDb.end();
    }
});

// API de logout
app.post('/api/v0/auth/logout', (req, res) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        return res.json({ success: true });
    });
});

// Endpoint para crear usuario (solo para desarrollo/setup inicial)
app.post('/api/v0/auth/register', express.json(), async (req, res) => {
    const { username, password, nombre, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const clientDb = await getDbClient();

    try {
        const usuario = await crearUsuario(clientDb, username, password, nombre, email);

        if (usuario) {
            return res.status(201).json({
                success: true,
                usuario: {
                    username: usuario.username,
                    nombre: usuario.nombre
                }
            });
        } else {
            return res.status(400).json({ error: 'No se pudo crear el usuario' });
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    } finally {
        await clientDb.end();
    }
});


const port = 4000;

app.listen(port, () => {
    console.log(`Servidor OAuth escuchando en http://localhost:${port}`);
});