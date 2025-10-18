import 'dotenv/config';
import express, { Request, Response, NextFunction } from "express";
import session from 'express-session';
import { Client } from "pg";

import { DefinicionesDeOperaciones, orquestador } from './orquestador.js';
import { operacionesAida, obtenerTodosLosAlumnos } from './aida.js';
import { autenticarUsuario, crearUsuario, Usuario } from './auth.js';
import * as fs from 'fs';
import Handlebars from 'handlebars';

// Extender tipos de sesión para incluir usuario
declare module 'express-session' {
    interface SessionData {
        usuario?: Usuario;
    }
}

const app = express()
const port = process.env.PORT || 3000

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

// Middleware para verificar autenticación en páginas HTML
function requireAuth(req: Request, res: Response, next: NextFunction) {
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

// ============= FIN ENDPOINTS DE AUTENTICACIÓN =============

// endpoint de prueba
app.get('/ask', (req, res) => {
    var htmlResponse = '<!doctype html>\n<html>\n<head>\n<meta charset="utf8">\n</head>\n<body>';
    if (JSON.stringify(req.query).length > 2) {
        htmlResponse += '<div>Yes ' + JSON.stringify(req.query) + '</div>';
    }
    if (req.body) {
        htmlResponse += '<div>Body: ' + JSON.stringify(req.body) + '</div>';
    }
    htmlResponse + '</body></html>'
    res.send(htmlResponse);
})

// Servidor del frontend:
const HTML_ARCHIVO=
`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CSV Upload</title>
</head>
<body>
  <h2>Subir archivo CSV</h2>
  <input type="file" id="csvFile" accept=".csv" />
  <button onclick="handleUpload()">Procesar y Enviar</button>

  <script>
    async function handleUpload() {
      const fileInput = document.getElementById('csvFile');
      const file = fileInput.files[0];
      if (!file) {
        alert('Por favor seleccioná un archivo CSV.');
        return;
      }

      const text = await file.text();

      try {
        const response = await fetch('../api/v0/alumnos', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'text/csv'
          },
          body: text
        });

        if (response.ok) {
          alert('Datos enviados correctamente.');
        } else {
          alert('Error al enviar los datos.');
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error de red o en el servidor.');
      }
    }
  </script>
</body>
</html>
`;

app.get('/app/archivo', requireAuth, (_, res) => {
    res.send(HTML_ARCHIVO)
})

// Endpoint para obtener todos los alumnos en formato JSON
app.get('/api/v0/alumnos', requireAuthAPI, async (_, res) => {
    const clientDb = new Client({
        connectionString: process.env.DATABASE_URL
    });
    try {
        await clientDb.connect();
        const alumnos = await obtenerTodosLosAlumnos(clientDb);
        res.json(alumnos);
    } catch (error) {
        console.error('Error al obtener los alumnos:', error);
    } finally {
        await clientDb.end();
    }
})

// Cargar la plantilla
const templateSource = fs.readFileSync('./src/views/alumnos.html', 'utf8');
const alumnosTemplate = Handlebars.compile(templateSource);

// Función para obtener la conexión a la base de datos
async function getDbClient() {
    const client = new Client({
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD
    });
    await client.connect();
    return client;
}

// Endpoint para mostrar la tabla de alumnos
app.get('/app/alumnos', requireAuth, async (_, res) => {
    const clientDb = await getDbClient();

    try {
        const alumnos = await obtenerTodosLosAlumnos(clientDb);

        if (!alumnos || alumnos.length === 0) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head><title>Lista de Alumnos</title></head>
                <body>
                    <h1>Lista de Alumnos</h1>
                    <p>No hay alumnos registrados.</p>
                </body>
                </html>
            `);
        }

        // Preparar los datos para la plantilla
        const columnas = Object.keys(alumnos[0] as Record<string, unknown>);
        const alumnosData = alumnos.map((alumno: Record<string, unknown>) => {
            const row: Record<string, string> = {};
            columnas.forEach(col => {
                row[col] = alumno[col] !== null && alumno[col] !== undefined ? String(alumno[col]) : '';
            });
            return row;
        });

        // Renderizar la plantilla con los datos
        const html = alumnosTemplate({
            alumnos: alumnosData,
            columnas: columnas
        });

        return res.send(html);
    } catch (error) {
        console.error('Error al obtener los alumnos:', error);
        return res.status(500).send('Error al cargar la lista de alumnos');
    } finally {
        try {
            await clientDb.end();
        } catch (e) {
            console.error('Error cerrando la conexión a la base de datos:', e);
        }
    }
});

// Endpoint para crear un nuevo alumno
app.post('/api/v0/alumnos', requireAuthAPI, express.json(), async (req, res) => {
    const clientDb = await getDbClient();

    try {
        const alumno = req.body;
        const columnas = Object.keys(alumno);
        const valores = columnas.map(col => alumno[col]);
        const placeholders = columnas.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO aida.alumnos (${columnas.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await clientDb.query(query, valores);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el alumno:', error);
        res.status(500).json({ error: 'Error al crear el alumno' });
    } finally {
        await clientDb.end();
    }
});

// Endpoint para   un alumno
app.put('/api/v0/alumnos/:lu', express.json(), async (req, res) => {
    const clientDb = await getDbClient();
    const { lu } = req.params;

    try {
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
        }

        const setClause = Object.keys(updates)
            .map((key, i) => `${key} = $${i + 1}`)
            .join(', ');
        const valores = [...Object.values(updates), lu];

        const query = `
            UPDATE aida.alumnos
            SET ${setClause}
            WHERE lu = $${valores.length}
            RETURNING *
        `;

        const result = await clientDb.query(query, valores);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar el alumno:', error);
        return res.status(500).json({ error: 'Error al actualizar el alumno' });
    } finally {
        try {
            await clientDb.end();
        } catch (e) {
            console.error('Error cerrando la conexión a la base de datos:', e);
        }
    }
});

// Endpoint para eliminar un alumno
app.delete('/api/v0/alumnos/:lu', requireAuthAPI, async (req, res) => {
    const clientDb = await getDbClient();
    const { lu } = req.params;

    try {
        // Primero verificar si el alumno existe
        const checkResult = await clientDb.query(
            'SELECT * FROM aida.alumnos WHERE lu = $1',
            [lu]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        // Si existe, proceder con la eliminación
        await clientDb.query(
            'DELETE FROM aida.alumnos WHERE lu = $1',
            [lu]
        );

        return res.json({ message: 'Alumno eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el alumno:', error);
        return res.status(500).json({ error: 'Error al eliminar el alumno' });
    } finally {
        try {
            await clientDb.end();
        } catch (e) {
            console.error('Error cerrando la conexión a la base de datos:', e);
        }
    }
});

const HTML_ARCHIVO_JSON=
`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>CSV Upload</title>
</head>
<body>
  <h2>Subir archivo CSV</h2>
  <input type="file" id="csvFile" accept=".csv" />
  <button onclick="handleUpload()">Procesar y Enviar</button>

  <script>
    function parseCSV(text) {
      const lines = text.trim().split(/\\r?\\n/);
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });
      return data;
    }

    async function handleUpload() {
      const fileInput = document.getElementById('csvFile');
      const file = fileInput.files[0];
      if (!file) {
        alert('Por favor seleccioná un archivo CSV.');
        return;
      }

      const text = await file.text();
      const jsonData = parseCSV(text);

      try {
        const response = await fetch('../api/v0/alumnos', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(jsonData)
        });

        if (response.ok) {
          alert('Datos enviados correctamente.');
        } else {
          alert('Error al enviar los datos.');
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error de red o en el servidor.');
      }
    }
  </script>
</body>
</html>
`;

app.get('/app/archivo-json', requireAuth, (_, res) => {
    res.send(HTML_ARCHIVO_JSON)
})


// API DEL BACKEND
function apiBackend(operaciones: DefinicionesDeOperaciones) {

    var NO_IMPLEMENTADO='<code>ERROR 404 </code> <h1> No implementado aún ⚒<h1>';

    var menu = '<h1>AIDA API</h1><ul>';
    for (const operacion of operaciones) {
        if (operacion.visible) {
            menu += `<li><a href="./${operacion.operacion}">${operacion.descripcion}</a></li>`;
        }

        const HTML_PANTALLA=
        `<!doctype html>
        <html>
            <head>
                <meta charset="utf8">
            </head>
            <body>
                <h2>${operacion.descripcion}</h2>
                <div><label>${operacion.operacion}: <input name="${operacion.operacion}"></label></div>
                <button id="btnEnviar">Obtener</button>
                <script>
                    window.onload = function() {
                        document.getElementById("btnEnviar").onclick = function() {
                            var valor = document.getElementsByName("${operacion.operacion}")[0].value;
                            window.location.href = "../api/v0/${operacion.operacion}/" + encodeURIComponent(valor);
                        }
                    }
                </script>
            </body>
        </html>
        `;

        app.get('/app/'+operacion.operacion, requireAuth, (_, res) => {
            res.send(HTML_PANTALLA);
        });

        app.get('/api/v0/'+operacion.operacion+'/:arg1', requireAuthAPI, async (req, res) => {
            console.log(req.params, req.query, req.body);
            const argumentos = [req.params.arg1 as string];
            await orquestador(operaciones, [{operacion: operacion.operacion, argumentos }])
            res.status(404).send(NO_IMPLEMENTADO);
        })
    }

    app.get('/app/menu', requireAuth, (req, res) => {
        const usuario = req.session.usuario;
        const menuHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf8">
                <title>AIDA - Menú Principal</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #667eea;
                    }
                    .user-info {
                        color: #666;
                    }
                    .logout-btn {
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    .logout-btn:hover {
                        background: #c82333;
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                    }
                    li {
                        margin: 10px 0;
                    }
                    a {
                        color: #667eea;
                        text-decoration: none;
                        font-size: 18px;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>🎓 AIDA API</h1>
                        <div class="user-info">
                            Bienvenido, <strong>${usuario?.nombre || usuario?.username}</strong>
                        </div>
                    </div>
                    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
                </div>
                ${menu}
            </body>
            <script>
                async function logout() {
                    try {
                        await fetch('/api/v0/auth/logout', { method: 'POST' });
                        window.location.href = '/app/login';
                    } catch (error) {
                        console.error('Error al cerrar sesión:', error);
                        alert('Error al cerrar sesión');
                    }
                }
            </script>
            </html>
        `;
        res.send(menuHtml);
    })

    app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}/app/menu`)
    })

}

apiBackend(operacionesAida);