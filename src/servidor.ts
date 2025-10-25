import express from "express";


import { DefinicionesDeOperaciones, orquestador } from './orquestador.js';
import { cargarNovedadesAlumnosDesdeJson, operacionesAida } from './aida.js'
import { crearApiCrud } from "./crud-basico.js";

const app = express()
app.use(express.json());
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
/*
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
            'Content-Type': 'text/json'
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
*/
app.get('/app/archivo', (_, res) => {
    //res.send(HTML_ARCHIVO)
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

app.get('/app/archivo-json', (_, res) => {
    res.send(HTML_ARCHIVO_JSON)
})


// API DEL BACKEND
function apiBackend(operaciones: DefinicionesDeOperaciones) {

    //var NO_IMPLEMENTADO='<code>ERROR 404 </code> <h1> No implementado aún ⚒<h1>';

    var menu = '<h1>AIDA API</h1><ul>';
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

        app.get('/app/'+operacion.operacion, (_, res) => {
            res.send(HTML_PANTALLA);
        });

        app.get('/api/v0/'+operacion.operacion+'/:arg1', async (req, res) => {
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

    app.get('/app/menu', (_, res) => {
        res.send(menu)
    })
    //REVISAR CODIGO ANTES DE SUBIR A GIT
    app.patch('/api/v0/alumnos', async (req, res) => {
        const alumnosJson = req.body;
        await cargarNovedadesAlumnosDesdeJson(alumnosJson);
        res.status(200).send('<h1>Carga de datos JSON exitosa!</h1>');
    });

    app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}/app/menu`)
    })


}

apiBackend(operacionesAida);

app.get('/app/style.css', (_, res) => {
    res.sendFile(`${process.cwd()}/style.css`);
});

crearApiCrud(app, '/api/v0')
app.get('/app/alumno', (_, res) => {
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


app.get('/app/alumno.js', (_, res) => {
    res.sendFile(`${process.cwd()}/alumno.js`);
});

const HTML_EDITAR = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Datos del Alumno</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }

        .form-group {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

        .form-group label {
            flex-basis: 150px;
            font-weight: bold;
            color: #555;
            margin-right: 20px;
        }

        .data-current {
            flex-basis: 250px;
            padding: 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            color: #6c757d;
            margin-right: 20px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .data-input {
            flex-grow: 1;
        }

        .data-input input[type="text"],
        .data-input input[type="number"],
        .data-input input[type="date"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }

        button {
            background-color: #28a745;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
            margin-top: 20px;
            width: 100%;
        }

        button:hover {
            background-color: #218838;
        }

        #nuevaLU {
            background-color: #f8d7da;
            color: #721c24;
            font-weight: bold;
        }

    </style>
</head>
<body>

<div class="container">
    <h1>Edición de Datos del Alumno</h1>

    <form id="form-edicion">

        <div class="form-group">
            <label for="lu">LU</label>
            <div class="data-current" id="lu_actual">---</div>
            <div class="data-input">
                <input type="text" id="nuevaLU" name="lu" value="" disabled>
            </div>
        </div>

        <div class="form-group">
            <label for="apellido">Apellido</label>
            <div class="data-current" id="apellido_actual">---</div>
            <div class="data-input">
                <input type="text" id="nuevoApellido" name="apellido" value="" placeholder="Nuevo Apellido">
            </div>
        </div>

        <div class="form-group">
            <label for="nombres">Nombres</label>
            <div class="data-current" id="nombre_actual">---</div>
            <div class="data-input">
                <input type="text" id="nuevoNombre" name="nombres" value="" placeholder="Nuevos Nombres">
            </div>
        </div>

        <div class="form-group">
            <label for="titulo">Título</label>
            <div class="data-current" id="titulo_actual">---</div>
            <div class="data-input">
                <input type="text" id="nuevoTitulo" name="titulo" value="" placeholder="Nuevo Título">
            </div>
        </div>

        <div class="form-group">
            <label for="titulo_en_tramite">Título en Trámite</label>
            <div class="data-current" id="estado_tramite_actual">---</div>
            <div class="data-input">
                <input type="date" id="nuevoEstadoTramiteTitulo" name="titulo_en_tramite" value="">
            </div>
        </div>

        <div class="form-group">
            <label for="egreso">Fecha de Egreso</label>
            <div class="data-current" id="fecha_egreso">---</div>
            <div class="data-input">
                <input type="date" id="nuevaFechaDeEgreso" name="egreso" value="">
            </div>
        </div>

        <button type="submit">Guardar Cambios</button>
    </form>
</div>

<script>

    function cargarDatos(alumno) {

        document.getElementById('lu_actual').textContent = alumno.lu;
        document.getElementById('nuevaLU').value = alumno.lu;

        document.getElementById('apellido_actual').textContent = alumno.apellido;
        document.getElementById('nuevoApellido').value = alumno.apellido;

        document.getElementById('nombre_actual').textContent = alumno.nombres;
        document.getElementById('nuevoNombre').value = alumno.nombres;

        document.getElementById('titulo_actual').textContent = alumno.titulo;
        document.getElementById('nuevoTitulo').value = alumno.titulo;

        const enTramite = alumno.titulo_en_tramite === null;
        document.getElementById('estado_tramite_actual').textContent = enTramite ? 'No' : alumno.titulo_en_tramite.slice(0, 10);
        document.getElementById('nuevoEstadoTramiteTitulo').value = enTramite ? 'dd/mm/yy' : alumno.titulo_en_tramite.slice(0, 10);

        const seEgreso = alumno.egreso === null;
        document.getElementById('fecha_egreso').textContent = seEgreso ? 'No' : alumno.egreso.slice(0, 10);
        document.getElementById('nuevaFechaDeEgreso').value = seEgreso ? 'dd/mm/yy' : alumno.egreso.slice(0, 10);

    }

    function getLuFromUrl() {
        const pathname = window.location.pathname.replace(/\\/$/, '');
        const pathParts = pathname.split('/');
        const luCodificado = pathParts[pathParts.length - 1];
        return decodeURIComponent(luCodificado);
    }

window.onload = async function() {
    const luActual = getLuFromUrl();
    try {

        var req = await fetch('http://localhost:3000/api/v0/alumnos/' + encodeURIComponent(luActual),{
            method: 'GET'
        });
        var data = await req.json();
        cargarDatos(data);

    } catch (error) {
        console.error('Error al cargar datos del alumno: ', error);
    }

    document.getElementById('form-edicion').addEventListener('submit', async function(event) {
        event.preventDefault();
        const form = event.target;
        const datosEditados = {
            lu: form.lu.value,
            apellido: form.apellido.value,
            nombres: form.nombres.value,
            titulo: form.titulo.value,
            titulo_en_tramite: form.titulo_en_tramite.value || null,
            egreso: form.egreso.value || null
        };
        try{
            var req = await fetch('http://localhost:3000/api/v0/alumnos/' + encodeURIComponent(luActual), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosEditados)
            });
            if (req.ok) {
                alert('Datos actualizados correctamente.');
                window.location.href = '/app/alumno';
            }
        }
        catch(error){
            console.error('Error al actualizar datos del alumno: ', error);
            alert('Error al actualizar los datos.');
        }
    });
};
</script>

</body>
</html>
`;

const HTML_CREAR = `
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear nuevo Alumno</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #007bff;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .form-group {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .form-group label {
            flex-basis: 150px;
            font-weight: bold;
            color: #555;
            margin-right: 20px;
        }
        .data-input {
            flex-grow: 1;
        }
        .data-input input[type="text"],
        .data-input input[type="number"],
        .data-input input[type="date"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button[type="submit"] {
            background-color: #28a745;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
            margin-top: 20px;
            width: 100%;
        }
        button[type="submit"]:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Crear nuevo Alumno</h1>

    <form id="form-creacion">

        <div class="form-group">
            <label for="lu">LU</label>
            <div class="data-input">
                <input type="text" id="nuevaLU" name="lu" value="" placeholder="LU">
            </div>
        </div>

        <div class="form-group">
            <label for="apellido">Apellido</label>
            <div class="data-input">
                <input type="text" id="nuevoApellido" name="apellido" value="" placeholder="Apellido">
            </div>
        </div>

        <div class="form-group">
            <label for="nombres">Nombres</label>
            <div class="data-input">
                <input type="text" id="nuevoNombre" name="nombres" value="" placeholder="Nombres">
            </div>
        </div>

        <div class="form-group">
            <label for="titulo">Título</label>
            <div class="data-input">
                <input type="text" id="nuevoTitulo" name="titulo" value="" placeholder="Título">
            </div>
        </div>

        <div class="form-group">
            <label for="titulo_en_tramite">Título en Trámite</label>
            <div class="data-input">
                <input type="date" id="nuevoEstadoTramiteTitulo" name="titulo_en_tramite" value="">
            </div>
        </div>

        <div class="form-group">
            <label for="egreso">Fecha de Egreso</label>
            <div class="data-input">
                <input type="date" id="nuevaFechaDeEgreso" name="egreso" value="">
            </div>
        </div>

        <button type="submit">Guardar Cambios</button>
    </form>
</div>
<script>

    function inicializarDatos() {

        document.getElementById('nuevaLU').value = "";

        document.getElementById('nuevoApellido').value = "";

        document.getElementById('nuevoNombre').value = "";

        document.getElementById('nuevoTitulo').value = "";

        document.getElementById('nuevoEstadoTramiteTitulo').value = 'dd/mm/yy';

        document.getElementById('nuevaFechaDeEgreso').value = 'dd/mm/yy';

    }


    window.onload = async function() {
        try {

            //var req = await fetch('http://localhost:3000/api/v0/alumno',{
            //method: 'GET'
            //});
            inicializarDatos();

        } catch (error) {
            console.error('Error al inicializar datos: ', error);
        }
    }
    document.getElementById('form-creacion').addEventListener('submit', async function(event) {
        event.preventDefault();
        const form = event.target;
        const datosCreados = {
            lu: form.lu.value,
            apellido: form.apellido.value,
            nombres: form.nombres.value,
            titulo: form.titulo.value,
            titulo_en_tramite: form.titulo_en_tramite.value || null,
            egreso: form.egreso.value || null
        };
        try{
            var req = await fetch('http://localhost:3000/api/v0/alumnos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCreados)
            });
            if (req.ok) {
                alert('Datos Creados correctamente.');
                window.location.href = '/app/alumno';
            }
        }
        catch(error){
            console.error('Error al añadir los datos del alumno: ', error);
            alert('Error al crear los datos.');
        }
    });
</script>
</body>
</html>
`;



app.get('/app/alumno/editarAlumno/:lu', (req, res) => {
    const luAlumno = req.params.lu;
    console.log(`Solicitud de edición para el alumno con LU: ${luAlumno}`);
    res.send(HTML_EDITAR);
});

app.get('/app/alumno/crearAlumno', (_, res) => {
    console.log(`Solicitud de Creacion de un Alumno`);
    res.send(HTML_CREAR);
});