import 'dotenv/config';
import { Client } from "pg";
import * as Express from "express";


/*interface KeyPorTabla {
    tabla: string;
    key: string[];
}*/

interface QueryUpdatePorTabla{
    tabla: string;
    queryUpdate: string;
    campos: string[];
}

interface QueryInsertPorTabla{
    tabla: string;
    queryInsert: string;
    campos: string[];
}


interface QueryImportarPorTabla{
    tabla: string;
    queryImportar: string;
}

interface QueryGetPorTabla{
    tabla: string;
    queryGet: string;
}

interface QueryDeletePorTabla{
    tabla: string;
    queryDelete: string;
}


const queryUpdatePorTabla: QueryUpdatePorTabla[] = [
    { tabla: 'alumnos',
      queryUpdate: `UPDATE aida.alumnos SET apellido=$1, nombres=$2, titulo=$3, titulo_en_tramite=$4, egreso=$5, mail=$6 WHERE lu=$7`,
      campos: ['apellido', 'nombres', 'titulo', 'titulo_en_tramite', 'egreso', 'mail', 'lu']},
      {
        tabla: 'materia',
        queryUpdate: `UPDATE aida.materia SET nombre=$1 WHERE id_materia=$2`,
        campos: ['nombre', 'id_materia']
      },
      {
        tabla: 'carrera',
        queryUpdate: `UPDATE aida.carrera SET nombre=$1 WHERE id_carrera=$2`,
        campos: ['nombre', 'id_carrera']
      },
      {
        tabla: 'cursada',
        queryUpdate: `UPDATE aida.cursada SET nota=$1, profesor=$2 WHERE lu=$3 AND id_materia=$4 AND cuatrimestre=$5`,
        campos: ['nota', 'profesor', 'lu', 'id_materia', 'cuatrimestre']
      }
];

const queryInsertPorTabla: QueryInsertPorTabla[] = [
    { tabla: 'alumnos',
      queryInsert: `INSERT INTO aida.alumnos
                (lu,apellido,nombres,titulo,titulo_en_tramite,egreso,mail) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      campos: ['lu', 'apellido', 'nombres', 'titulo', 'titulo_en_tramite', 'egreso', 'mail']},
      {
        tabla: 'materia',
        queryInsert: `INSERT INTO aida.materia
                  (id_materia,nombre) VALUES ($1,$2)`,
        campos: ['id_materia', 'nombre']
      },
      {
        tabla: 'carrera',
        queryInsert: `INSERT INTO aida.carrera
                  (id_carrera,nombre) VALUES ($1,$2)`,
        campos: ['id_carrera', 'nombre']
      },
      {
        tabla: 'materiasporcarrera',
        queryInsert: `INSERT INTO aida.materiasporcarrera
                  (id_carrera,id_materia) VALUES ($1,$2)`,
        campos: ['id_carrera', 'id_materia']
      },
      {
        tabla: 'alumnosporcarrera',
        queryInsert: `INSERT INTO aida.alumnosporcarrera
                  (lu,id_carrera) VALUES ($1,$2)`,
        campos: ['lu', 'id_carrera']
      },
      {
        tabla: 'cursada',
        queryInsert: `INSERT INTO aida.cursada
                  (lu,id_materia,cuatrimestre,nota,profesor) VALUES ($1,$2,$3,$4,$5)`,
        campos: ['lu', 'id_materia', 'cuatrimestre', 'nota', 'profesor']
      }
];

const queryImportarPorTabla: QueryImportarPorTabla[] = [
    { tabla: 'alumnos',
      queryImportar: `SELECT
                lu,
                apellido,
                nombres,
                titulo,
                TO_CHAR(titulo_en_tramite, 'YYYY-MM-DD') AS titulo_en_tramite,
                TO_CHAR(egreso, 'YYYY-MM-DD') AS egreso,
                mail
            FROM aida.alumnos`,
      },
      {
        tabla: 'materia',
        queryImportar: `SELECT
                  id_materia,
                  nombre
              FROM aida.materia`,
      },
      {
        tabla: 'carrera',
        queryImportar: `SELECT
                  id_carrera,
                  nombre
                FROM aida.carrera`,
      },
      {
        tabla: 'materiasporcarrera',
        queryImportar: `SELECT
                    id_carrera,
                    id_materia
                  FROM aida.materiasporcarrera`,
      },
      {
        tabla: 'alumnosporcarrera',
        queryImportar: `SELECT
                    lu,
                    id_carrera
                  FROM aida.alumnosporcarrera`,
      },
      {
        tabla: 'cursada',
        queryImportar: `SELECT
                    lu,
                    id_materia,
                    cuatrimestre,
                    nota,
                    profesor
                  FROM aida.cursada`,
      }
];

const queryGetPorTabla: QueryGetPorTabla[] = [
    { tabla: 'alumnos',
        queryGet: `SELECT * FROM aida.alumnos WHERE lu=$1`},
    { tabla: 'materia',
        queryGet: `SELECT * FROM aida.materia WHERE id_materia=$1`},
    { tabla: 'carrera',
        queryGet: `SELECT * FROM aida.carrera WHERE id_carrera=$1`},
    { tabla: 'materiasporcarrera',
        queryGet: `SELECT * FROM aida.materiasporcarrera WHERE id_carrera=$1 AND id_materia=$2`},
    { tabla: 'alumnosporcarrera',
        queryGet: `SELECT * FROM aida.alumnosporcarrera WHERE lu=$1 AND id_carrera=$2`},
    { tabla: 'cursada',
        queryGet: `SELECT * FROM aida.cursada WHERE lu=$1 AND id_materia=$2 AND cuatrimestre=$3`},
];

const queryDeletePorTabla: QueryDeletePorTabla[] = [
    { tabla: 'alumnos',
        queryDelete: `DELETE FROM aida.alumnos WHERE lu=$1`},
    { tabla: 'materia',
        queryDelete: `DELETE FROM aida.materia WHERE id_materia=$1`},
    { tabla: 'carrera',
        queryDelete: `DELETE FROM aida.carrera WHERE id_carrera=$1`},
    { tabla: 'materiasporcarrera',
        queryDelete: `DELETE FROM aida.materiasporcarrera WHERE id_carrera=$1 AND id_materia=$2`},
    { tabla: 'alumnosporcarrera',
        queryDelete: `DELETE FROM aida.alumnosporcarrera WHERE lu=$1 AND id_carrera=$2`},
    { tabla: 'cursada',
        queryDelete: `DELETE FROM aida.cursada WHERE lu=$1 AND id_materia=$2 AND cuatrimestre=$3`},
];

export function crearApiCrud(app:Express.Application, rutaApi:string, requireAuthAPI: any){
    var ruta = `${rutaApi}/:tabla`;

    app.get(ruta, requireAuthAPI, async (req, res) => {
        const tabla = req.params.tabla;
        const query = queryImportarPorTabla.find(q => q.tabla === tabla)?.queryImportar;
        console.log('Listando la tabla:', tabla);
        const clientDb = new Client({ connectionString: process.env.DATABASE_URL });
        await clientDb.connect();
        if(query){
            try {
                var items = await clientDb.query(query);
                res.json(items.rows);
            } catch (error) {
                console.error(`Error al listar los datos:`, error);
                res.status(500).json({ error: 'Error al listar los datos' });
            } finally {
                await clientDb.end();
            }
        }
    });

    app.get(`${ruta}/:id`, requireAuthAPI, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const query = queryGetPorTabla.find(q => q.tabla === tabla)?.queryGet;
        const clientDb = new Client({ connectionString: process.env.DATABASE_URL });
        await clientDb.connect();
        try {
            const ids = req.params.id.split('_');
            var items = await clientDb.query(query!, ids);
            console.log('Datos listados correctamente');
            res.json(items.rows[0]);
        } catch (error) {
            console.error(`Error al listar los datos:`, error);
            res.status(500).json({ error: 'Error al listar los datos' });
        } finally {
            clientDb.end();
        }
    });


    app.post(`${ruta}`, requireAuthAPI, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const query = queryInsertPorTabla.find(q => q.tabla === tabla)?.queryInsert;
        const campos = queryInsertPorTabla.find(q => q.tabla === tabla)?.campos;
        const datosCampos = [];
        if(campos){
            for(const campo of campos){
                datosCampos.push(req.body[campo]);
            }
        }
        const clientDb = new Client({ connectionString: process.env.DATABASE_URL });
        await clientDb.connect();
        if(query){
            try {
                await clientDb.query(query, datosCampos);
                res.json('OK');
            } catch (error) {
                res.status(500).json({ error: 'Error al insertar los datos' });
            } finally {
                clientDb.end();
            }
        }
    });

    app.put(`${ruta}/:id`, requireAuthAPI, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const query = queryUpdatePorTabla.find(q => q.tabla === tabla)?.queryUpdate;
        const campos = queryUpdatePorTabla.find(q => q.tabla === tabla)?.campos;
        const datosCampos = [];
        if(campos){
            for(const campo of campos){
                datosCampos.push(req.body[campo]);
            }
        }
        const clientDb = new Client({ connectionString: process.env.DATABASE_URL });
        await clientDb.connect();
        if(query){
            try {
                await clientDb.query(query, datosCampos);
                res.json('OK');
            } catch (error) {
                res.status(500).json({ error: 'Error al actualizar los datos' });
            } finally {
                clientDb.end();
            }
        }
    });

    app.delete(`${ruta}/:id`, requireAuthAPI, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const query = queryDeletePorTabla.find(q => q.tabla === tabla)?.queryDelete;
        const clientDb = new Client({ connectionString: process.env.DATABASE_URL });
        await clientDb.connect();
        try {
            const ids = req.params.id.split('_');
            await clientDb.query(query!, ids);
            res.json('OK');
        } catch (error) {
            console.error(`Error al borrar alumnos:`, error);
            res.status(500).json({ error: 'Error al borrar los datos' });
        } finally {
            clientDb.end();
        }
    });
}

