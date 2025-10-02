import { Client } from "pg"
import { readFile, writeFile } from "fs/promises"
import * as Path from 'path';

import { Fecha } from "./fechas.js"
import * as Fechas from "./fechas.js";
import { DatoAtomico, datoATexto, sqlLiteral } from "./tipos-atomicos.js"
import { leerYParsearCsv } from "./csv.js"
import { DefinicionesDeOperaciones, DefinicionDeOperacion, ParametroDeOperacion } from "./orquestador.js";

export async function refrescarTablaAlumnos(clientDb: Client, listaDeAlumnosCompleta:string[][], columnas:string[]){
    await clientDb.query("DELETE FROM aida.alumnos");
    for (const values of listaDeAlumnosCompleta) {
        const query = `
            INSERT INTO aida.alumnos (${columnas.join(', ')}) VALUES
                (${values.map((value) => value == '' ? 'null' : sqlLiteral(value))})
        `;
        console.log(query)
        const res = await clientDb.query(query)
        console.log(res.command, res.rowCount)
    }
}

export type FiltroAlumnos = {fecha: Fecha} | {lu: string} | {uno: true}

async function obtenerAlumnoQueNecesitaCertificado(clientDb: Client, filtro:FiltroAlumnos):Promise<Record<string, (DatoAtomico)>[]>{
    const sql = `SELECT *
    FROM aida.alumnos
    WHERE titulo IS NOT NULL AND titulo_en_tramite IS NOT NULL
        ${`lu` in filtro ? `AND lu = ${sqlLiteral(filtro.lu)}` : ``}
        ${`fecha` in filtro ? `AND titulo_en_tramite = ${sqlLiteral(filtro.fecha)}` : ``}
    ORDER BY egreso
    ${`uno` in filtro ? `LIMIT 1` : ``}`;
    const res = await clientDb.query(sql)
    return res.rows;
}

async function generarCertificadoParaAlumno(pathPlantilla:string, alumno:Record<string, DatoAtomico>){
    let certificado = await readFile(pathPlantilla, { encoding: 'utf8' });
    for (const [key, value] of Object.entries(alumno)) {
        certificado = certificado.replace(
            `[#${key}]`,
            datoATexto(value)
        );
    }
    var nombreArchivoSalida = `certificado-de-${
        // @ts-ignore
        alumno.lu?.replace(/\W/g,'_') // cambio las barras `/` (o cualquier otro caracter que no sea un alfanumérico) por una raya `_`
    }-para-imprimir.html`;
    if (process.env.AIDA_CARPETA_INTERCAMBIO) {
        nombreArchivoSalida = Path.join(process.env.AIDA_CARPETA_INTERCAMBIO, 'salida', nombreArchivoSalida);
    } else {
        nombreArchivoSalida = Path.join('recursos', nombreArchivoSalida);
    }
    await writeFile(nombreArchivoSalida, certificado, 'utf-8');
    console.log('certificado impreso para alumno', alumno.lu);
}

export async function cargarNovedadesAlumnosDesdeCsv({clientDb}: {clientDb:Client}, {archivo}: {archivo:string}){
    if (process.env.AIDA_CARPETA_INTERCAMBIO) {
        archivo = Path.join(process.env.AIDA_CARPETA_INTERCAMBIO, 'entrada', archivo);
    }
    var {dataLines: listaDeAlumnosCompleta, columns: columnas} = await leerYParsearCsv(archivo)
    await refrescarTablaAlumnos(clientDb, listaDeAlumnosCompleta, columnas);
}

async function generarCertificadoAlumno(clientDb:Client, filtro:FiltroAlumnos){
    var alumnos = await obtenerAlumnoQueNecesitaCertificado(clientDb, filtro);
    if (alumnos.length == 0){
        console.log('No hay alumnos que necesiten certificado para el filtro', filtro);
    }
    for (const alumno of alumnos) {
        await generarCertificadoParaAlumno(`recursos/plantilla-certificado.html`, alumno);
    }
}

export async function generarCertificadoAlumnoPrueba({clientDb}:{clientDb:Client}, _:{}){
    return generarCertificadoAlumno(clientDb, {uno:true})
}

export async function generarCertificadoAlumnoLu({clientDb}:{clientDb:Client}, {lu}:{lu:string}){
    return generarCertificadoAlumno(clientDb, {lu})
}

export async function generarCertificadoAlumnoFecha({clientDb}:{clientDb:Client}, {fecha}:{fecha:Fecha}){
    return generarCertificadoAlumno(clientDb, {fecha})
}

export const operacionesAida = {
    'prueba-primero': {
        parametros: {},
        accion: generarCertificadoAlumnoPrueba,
        visible: false,
        descripcion: 'Prueba de la primera operación'
    },
    archivo: {
        parametros:{
            archivo: {tipo:'string', etiqueta: 'archivo'}
        },
        accion: cargarNovedadesAlumnosDesdeCsv,
        visible: true,
        descripcion: 'Carga novedades de alumnos desde un archivo CSV'
    },
    fecha: {
        parametros: {
            fecha: {tipo:'Fecha', etiqueta: 'fecha del trámite'}
        },
        accion: generarCertificadoAlumnoFecha,
        visible: true,
        descripcion: 'Genera certificado por fecha de trámite'
    },
    lu: {
        parametros: {
            lu: {tipo:'string', etiqueta: 'libreta universitaria'}
        },
        accion: generarCertificadoAlumnoLu,
        visible: true,
        descripcion: 'Genera certificado por LU'
    }
} satisfies Record<string, DefinicionDeOperacion<Record<string, DatoAtomico>>>;

