import express from "express";
//import session, { SessionData } from 'express-session';
import session from 'express-session';
import { autenticarUsuario, crearUsuario, Usuario } from './auth.js';
import { Request, Response, NextFunction } from "express";
import * as fs from 'fs';
import { Client } from "pg";
import { DefinicionesDeOperaciones, orquestador } from './orquestador.js';
import { cargarNovedadesAlumnosDesdeJson, operacionesAida } from './aida.js'
import { crearApiCrud } from "./crud-basico.js";

const app = express()
app.use(express.json());
const port = 3000

declare module 'express-session' {
    interface SessionData {
        usuario?: Usuario;
    }
}

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
app.use(express.json({ limit: '10mb' })); // para poder leer el body
app.use(express.urlencoded({ extended: true, limit: '10mb'  })); // para poder leer el body
app.use(express.text({ type: 'text/csv', limit: '10mb' })); // para poder leer el body como texto plano

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
app.get('/app/archivo', requireAuth, (_, res) => {
    res.redirect('/app/archivo-json');
})

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
        const response = await fetch('/api/v0/alumnos', {
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

async function getDbClient() {
    const client = new Client();
    await client.connect();
    return client;
}

//API de login

app.get('/app/login', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/app/menu');
    }
    const loginHtml = fs.readFileSync('login.html', 'utf8');
    res.send(loginHtml);
});

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

//Funciones middleware de Auth
function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/app/login');
    }
}


function requireAuthAPI(req: Request, res: Response, next: NextFunction) {
    if (req.session.usuario) {
        next();
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
}


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

// API DEL BACKEND
function apiBackend(operaciones: DefinicionesDeOperaciones) {

   //Pagina del menu

    var menu = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/app/styleMenu.css">
      </head>
      <body>
        <h1>AIDA API</h1>
        <ul>`;
    menu += `<li><a href="/app/alumno">Alumnos</a></li>`;
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
            const htmlVacio =
               `<!DOCTYPE html>
                <html>
                <head>
                    <title>Certificados Múltiples</title>
                    <style>
                        .certificado-container {
                          page-break-after: always;
                          padding: 20px;
                          border: 1px solid #ccc;
                          margin-bottom: 20px;
                      }
                    </style>
                </head>
                <body>

                </body>
                </html>`.replace(/\s/g, '');
            const resultado = await orquestador(operaciones, [{operacion: operacion.operacion, argumentos }]);
            const resultadoLimpio = resultado ? resultado.replace(/\s/g, '') : '';
            if (!resultado || resultadoLimpio === htmlVacio) {
              res.status(404).send('No hay alumnos que necesiten certificado para ese filtro');
            }else{
              res.set('Content-Type', 'text/html');
              res.status(200).send(resultado);
            }
        })
    }
    menu += `<li><a href="#" id="boton-logout" class="boton-logout">Cerrar sesión</a></li>`;
    menu += `</ul>
             <script>
                document.getElementById('boton-logout').addEventListener('click', async function(event) {
                    event.preventDefault();
                    try { await fetch('/api/v0/auth/logout', {
                            method: 'POST'
                        });
                        window.location.href = '/app/login'; }
                    catch (error) { console.error('Error al cerrar sesión:', error); }
                });
             </script>`;


    app.get('/app/menu', requireAuth, (_, res) => {
        res.send(menu)
    })
    //PREGUNTAR SI PONGO POST ME LLAMA ESTO EN LUGAR DEL CRUD
    app.patch('/api/v0/alumnos', requireAuthAPI, async (req, res) => {
        const alumnosJson = req.body;
        await cargarNovedadesAlumnosDesdeJson(alumnosJson);
        res.status(200).send('<h1>Carga de datos JSON exitosa!</h1>');
    });

    app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}/app/login`)
    })


}

//Llamada a programas

apiBackend(operacionesAida);
crearApiCrud(app, '/api/v0', requireAuthAPI)

//Estilos
app.get('/app/styleMenu.css', (_, res) => {
    res.sendFile(`${process.cwd()}/styleMenu.css`);
});

app.get('/app/style.css', requireAuth, (_, res) => {
    res.sendFile(`${process.cwd()}/style.css`);
});


//Tabla Alumnos
app.get('/app/alumno', requireAuth, (_, res) => {
    res.send(`<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Alumnos</title>
            <link rel="stylesheet" href="/app/style.css">
        </head>
        <body>
            <h2>loading...</h2>
            <script src="/app/alumno.js"></script>
        </body>
        </html>`
    )
});

//Funciones Tabla Alumnos

//app.get('/app/:nombreTabla.js', requireAuth, (_, res) => {
//    res.sendFile(`${process.cwd()}/tablaGenerico.js`);
//});

app.get('/app/alumno.js', requireAuth, (_, res) => {
    res.sendFile(`${process.cwd()}/alumno.js`);
});

app.get('/app/alumno/editarAlumno/:lu', requireAuth, (req, res) => {
    const luAlumno = req.params.lu;
    console.log(`Solicitud de edición para el alumno con LU: ${luAlumno}`);
    res.sendFile(`${process.cwd()}/editarGenerico.html`);
});

app.get('/app/alumno/crearAlumno', requireAuth, (_, res) => {
    console.log(`Solicitud de Creacion de un Alumno`);
    res.sendFile(`${process.cwd()}/crearGenerico.html`);
});

//Diccionarios
app.get('/app/diccionarios.js', (_, res) => {
    res.sendFile(`${process.cwd()}/diccionarios.js`);
});