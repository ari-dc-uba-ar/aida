import { Client } from "pg";
import * as Express from "express";

interface KeyPorTabla {
    tabla: string;
    key: string;
}

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

const clavesPorTabla: KeyPorTabla[] = [
    { tabla: 'alumnos', key: 'lu' },
];

const queryUpdatePorTabla: QueryUpdatePorTabla[] = [
    { tabla: 'alumnos',
      queryUpdate: `UPDATE aida.alumnos SET apellido=$1, nombres=$2, titulo=$3, titulo_en_tramite=$4, egreso=$5 WHERE lu=$6`,
      campos: ['apellido', 'nombres', 'titulo', 'titulo_en_tramite', 'egreso', 'lu']},
];

const queryInsertPorTabla: QueryInsertPorTabla[] = [
    { tabla: 'alumnos',
      queryInsert: `INSERT INTO aida.alumnos
                (lu,apellido,nombres,titulo,titulo_en_tramite,egreso) VALUES ($1,$2,$3,$4,$5,$6)`,
      campos: ['lu', 'apellido', 'nombres', 'titulo', 'titulo_en_tramite', 'egreso']},
];

const queryImportarPorTabla: QueryImportarPorTabla[] = [
    { tabla: 'alumnos',
      queryImportar: `SELECT
                lu,
                apellido,
                nombres,
                titulo,
                TO_CHAR(titulo_en_tramite, 'YYYY-MM-DD') AS titulo_en_tramite,
                TO_CHAR(egreso, 'YYYY-MM-DD') AS egreso
            FROM aida.alumnos`,
      },
];

export function crearApiCrud(app:Express.Application, rutaApi:string){
    var ruta = `${rutaApi}/alumnos`;

    app.get(ruta, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const query = queryImportarPorTabla.find(q => q.tabla === tabla)?.queryImportar;
        console.log('Listando alumnos');
        const clientDb = new Client();
        await clientDb.connect();
        if(query){
            try {
                var items = await clientDb.query(query);
                res.json(items.rows);
            } catch (error) {
                console.error(`Error al listar alumnos:`, error);
                res.status(500).json({ error: 'Error al listar los datos' });
            } finally {
                await clientDb.end();
            }
        }
    });

    app.get(`${ruta}/:id`, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const key = clavesPorTabla.find(k => k.tabla === tabla)?.key;
        const clientDb = new Client();
        await clientDb.connect();
        try {
            var items = await clientDb.query(`SELECT * FROM aida.${tabla} WHERE ${key}=$1`, [req.params.id]);
            console.log('Datos listados correctamente');
            res.json(items.rows[0]);
        } catch (error) {
            console.error(`Error al listar alumnos:`, error);
            res.status(500).json({ error: 'Error al listar los datos' });
        } finally {
            clientDb.end();
        }
    });


    app.post(`${ruta}`, async (req, res) => {
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
        const clientDb = new Client();
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

    app.put(`${ruta}/:id`, async (req, res) => {
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
        const clientDb = new Client();
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

    app.delete(`${ruta}/:id`, async (req, res) => {
        const partes = req.url.split('/');
        const tabla = partes[3];
        const key = clavesPorTabla.find(k => k.tabla === tabla)?.key;
        const clientDb = new Client();
        await clientDb.connect();
        try {
            await clientDb.query(`DELETE FROM aida.${tabla} WHERE ${key}=$1`, [req.params.id]);
            res.json('OK');
        } catch (error) {
            console.error(`Error al borrar alumnos:`, error);
            res.status(500).json({ error: 'Error al borrar los datos' });
        } finally {
            clientDb.end();
        }
    });
}

