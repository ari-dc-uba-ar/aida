import express from "express";

import { DefinicionesDeOperaciones, orquestador } from './orquestador.js';
import { operacionesAida } from './aida.js'
import { crearApiCrud } from "./crud-basico.js";

const app = express()
const port = 3000

app.use(express.json({ limit: '10mb' })); // para poder leer el body
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // para poder leer el body
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

app.get('/app/archivo', (_, res) => {
    res.send(HTML_ARCHIVO)
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

app.get('/app/archivo-json', (_, res) => {
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

        app.get('/app/'+operacion.operacion, (_, res) => {
            res.send(HTML_PANTALLA);
        });

        app.get('/api/v0/'+operacion.operacion+'/:arg1', async (req, res) => {
            console.log(req.params, req.query, req.body);
            const argumentos = [req.params.arg1 as string];
            await orquestador(operaciones, [{operacion: operacion.operacion, argumentos }])
            res.status(404).send(NO_IMPLEMENTADO);
        })
    }

    app.get('/app/menu', (_, res) => {
        res.send(menu)
    })

    app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}/app/menu`)
    })

}

apiBackend(operacionesAida);

crearApiCrud(app, '/api/v0')
app.get('/app/alumno', (_, res) => {
    res.send(`<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>CSV Upload</title>
        </head>
        <body>
            <h2>loading...</h2>
            <script src="/app/alumno.js"></script>
        </body>
        </html>`
    )
});

app.get('/app/alumno.js', (_, res) => {
    res.sendFile(`${process.cwd()}/dist/alumno.js`);
});
