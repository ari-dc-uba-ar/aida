import { Client } from 'pg'
import type { QueryResult } from "pg";
import { readFile, writeFile } from 'node:fs/promises';

interface Alumno {
  lu: string;
  apellido:string;
  nombres: string;
  titulo: string;
  titulo_en_tramite: string | null;
  egreso: Date;
}

async function leerYParsearCsv(filePath:string):Promise<{ dataLines: string[]; columns: string[] }>{
    const contents:string = await readFile(filePath, { encoding: 'utf8' });
    const header:string = contents.split(/\r?\n/)[0];
    const columns:string[] = header.split(',').map(col => col.trim());
    const dataLines:string[] = contents.split(/\r?\n/).slice(1).filter(line => line.trim() !== '');
    return {dataLines, columns};
}

async function refrescarTablaAlumnos(clientDb:Client, listaDeAlumnosCompleta:string[], columnas:string[]): Promise<void> {
    await clientDb.query("DELETE FROM aida.alumnos");
    for (const line of listaDeAlumnosCompleta) {
        const values:string[] = line.split(',');
        const query:string = `
            INSERT INTO aida.alumnos (${columnas.join(', ')}) VALUES
                (${values.map((value) => value == '' ? 'null' : `'` + value + `'`).join(', ')})
        `;
        console.log(query)
        const res:QueryResult = await clientDb.query(query)
        console.log(res.command, res.rowCount)
    }
}

async function obtenerPrimerAlumnoQueNecesitaCertificado(clientDb:Client):Promise<Alumno|null>{
    const sql:string = `SELECT *
    FROM aida.alumnos
    WHERE titulo IS NOT NULL AND titulo_en_tramite IS NOT NULL
    ORDER BY egreso
	LIMIT 1`;
    const res:QueryResult<Alumno> = await clientDb.query(sql)
    if (res.rows.length > 0){
        return res.rows[0];
    } else {
        return null;
    }
}

function pasarAStringODarErrorComoCorresponda(value){
    var result = value == null ? '' :
            typeof value == "string" ? value :
            value instanceof Date ? value.toDateString() :
            null;
    if (result == null){
        throw new Error('No se puede convertir a string el valor: ' + value);
    }
    return result;
}


async function generarCertificadoParaAlumno(pathPlantilla: string, alumno: Alumno):Promise<void>{
    let certificado = await readFile(pathPlantilla, { encoding: 'utf8' });
    for (const [key, value] of Object.entries(alumno)) {
        certificado = certificado.replace(
            `[#${key}]`,
            pasarAStringODarErrorComoCorresponda(value)
        );
    }
    await writeFile(`recursos/certificado-para-imprimir.html`, certificado, 'utf-8');
    console.log('certificado impreso para alumno', alumno.lu);
}

async function cargar(parametro, clientDb: Client){
    const filePath:string = parametro;
    var {dataLines: listaDeAlumnosCompleta, columns: columnas} = await leerYParsearCsv(filePath)
    for (const line of listaDeAlumnosCompleta) {
        const values = line.split(',');

        const query = `
            INSERT INTO aida.alumnos (${columnas.join(', ')})
            VALUES (${values.map(v => v === '' ? 'null' : `'${v}'`).join(', ')})
            ON CONFLICT (lu) DO NOTHING`;

        console.log(query)
    await clientDb.query(query);
}

}
async function cliComandos(clientDb: Client){
    const comando = process.argv[process.argv.length-2];
    const parametro = process.argv[process.argv.length-1];

    if (comando !== undefined && parametro !== undefined){

        if (comando === 'cargar'){
            await cargar(parametro,clientDb)
        }

        else if (comando === 'fecha'){
        }

        else if (comando === 'LU'){
        }
    }
    console.log('parametros a considerar', comando, parametro)
}


async function principal():Promise<void>{
    const clientDb:Client = new Client()
    const filePath:string = `recursos/alumnos.csv`;
    await clientDb.connect()
    var {dataLines: listaDeAlumnosCompleta, columns: columnas} = await leerYParsearCsv(filePath)
    await refrescarTablaAlumnos(clientDb, listaDeAlumnosCompleta, columnas);
    var alumno: Alumno|null = await obtenerPrimerAlumnoQueNecesitaCertificado(clientDb);
    if (alumno == null){
        console.log('No hay alumnos que necesiten certificado');
    } else {
        await generarCertificadoParaAlumno(`recursos/plantilla-certificado.html`, alumno);
    }

    await cliComandos(clientDb);
    await clientDb.end()
}

principal();