import express from "express";

const app = express()
const port = 3000

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
const HTML_MENU=
`<!doctype html>
<html>
    <head>
        <meta charset="utf8">
    </head>
    <body>
        <h1>AIDA</h1>
        <p>menu</p>
        <p><a href="/app/lu">Imprimir certificado por LU</a></p>
        <p><a href="/app/fecha">Imprimir certificado por fecha de trámite</a></p>
        <p><a href="/app/archivo">Subir .csv con novedades de alumnos</a></p>
        <p><a href="/ask?p=np">¿Es P = NP?</a></p>
    </body>
</html>
`;

app.get('/app/menu', (_, res) => {
    res.send(HTML_MENU)
})

const HTML_LU=
`<!doctype html>
<html>
    <head>
        <meta charset="utf8">
    </head>
    <body>
        <div>Obtener el certificado de título en trámite</div>
        <div><label>Libreta Universitaria: <input name=lu></label></div>
        <button id="btnEnviar">Pedir Certificado</button>
        <script>
            window.onload = function() {
                document.getElementById("btnEnviar").onclick = function() {
                    var lu = document.getElementsByName("lu")[0].value;
                    window.location.href = "../api/v0/lu/" + lu;
                }
            }
        </script>
    </body>
</html>
`;

app.get('/app/lu', (_, res) => {
    res.send(HTML_LU)
})

const HTML_FECHA=
`<!doctype html>
<html>
    <head>
        <meta charset="utf8">
    </head>
    <body>
        <div>Obtener el certificado de título en trámite</div>
        <div><label>Fecha del trámite: <input name=fecha type=date></label></div>
        <button id="btnEnviar">Pedir Certificado</button>
        <script>
            window.onload = function() {
                document.getElementById("btnEnviar").onclick = function() {
                    var fecha = document.getElementsByName("fecha")[0].value;
                    window.location.href = "../api/v0/fecha/" + fecha;
                }
            }
        </script>
    </body>
</html>
`;

app.get('/app/fecha', (_, res) => {
    res.send(HTML_FECHA)
})

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
var NO_IMPLEMENTADO='<code>ERROR 404 </code> <h1> No implementado aún ⚒<h1>';

app.get('/api/v0/lu/:lu', (req, res) => {
    console.log(req.params, req.query, req.body);
    res.status(404).send(NO_IMPLEMENTADO);
})

app.get('/api/v0/fecha/:fecha', (req, res) => {
    console.log(req.params, req.query, req.body);
    res.status(404).send(NO_IMPLEMENTADO);
})

app.patch('/api/v0/alumnos', (req, res) => {
    console.log(req.params, req.query, req.body);
    res.status(404).send(NO_IMPLEMENTADO);
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/app/menu`)
})