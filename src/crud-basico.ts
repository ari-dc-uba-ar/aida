import { Client } from "pg";
import * as Express from "express";

export function crearApiCrud(app:Express.Application, rutaApi:string){
    var ruta = `${rutaApi}/alumno`;

    app.get(ruta, async (_, res) => {
        console.log('Listando alumnos');
        const clientDb = new Client();
        await clientDb.connect();
        try {
            var items = await clientDb.query(`SELECT
                lu,
                apellido,
                nombres,
                titulo,
                TO_CHAR(titulo_en_tramite, 'YYYY-MM-DD') AS titulo_en_tramite,
                TO_CHAR(egreso, 'YYYY-MM-DD') AS egreso
            FROM aida.alumnos`);
            res.json(items.rows);
        } catch (error) {
            console.error(`Error al listar alumnos:`, error);
            res.status(500).json({ error: 'Error al listar los datos' });
        } finally {
            await clientDb.end();
        }
    });

    app.get(`${ruta}/editarAlumno/:lu`, async (req, res) => {
        console.log('Un alumno', req.params.lu);
        const clientDb = new Client();
        await clientDb.connect();
        try {
            var items = await clientDb.query(`SELECT * FROM aida.alumnos WHERE lu=$1`, [req.params.lu]);
            console.log('Datos listados correctamente');
            res.json(items.rows[0]);
        } catch (error) {
            console.error(`Error al listar alumnos:`, error);
            res.status(500).json({ error: 'Error al listar los datos' });
        } finally {
            clientDb.end();
        }
    });


    app.post(`${ruta}/crearAlumno`, async (req, res) => {
        const clientDb = new Client();
        await clientDb.connect();
        try {
            await clientDb.query(`INSERT INTO aida.alumnos
                (lu,apellido,nombres,titulo,titulo_en_tramite,egreso) VALUES ($1,$2,$3,$4,$5,$6)`,
                [req.body.lu, req.body.apellido, req.body.nombres, req.body.titulo, req.body.titulo_en_tramite, req.body.egreso]
            );
            res.json('OK');
        } catch (error) {
            console.error(`Error al INSERTAR alumnos:`, error);
            res.status(500).json({ error: 'Error al insertar los datos' });
        } finally {
            clientDb.end();
        }
    });

    app.put(`${ruta}/editarAlumno/:lu`, async (req, res) => {
        const clientDb = new Client();
        await clientDb.connect();
        try {
            await clientDb.query(`UPDATE aida.alumnos SET
                apellido=$1, nombres=$2, titulo=$3, titulo_en_tramite=$4, egreso=$5 WHERE lu=$6`,
                [req.body.apellido, req.body.nombres, req.body.titulo, req.body.titulo_en_tramite, req.body.egreso, req.body.lu]
            );
            res.json('OK');
        } catch (error) {
            console.error(`Error al actualizar alumnos:`, error);
            res.status(500).json({ error: 'Error al actualizar los datos' });
        } finally {
            clientDb.end();
        }
    });

    app.delete(`${ruta}/:lu`, async (req, res) => {
        const clientDb = new Client();
        await clientDb.connect();
        try {
            await clientDb.query(`DELETE FROM aida.alumnos WHERE lu=$1`, [req.params.lu]);
            res.json('OK');
        } catch (error) {
            console.error(`Error al borrar alumnos:`, error);
            res.status(500).json({ error: 'Error al borrar los datos' });
        } finally {
            clientDb.end();
        }
    });
}

