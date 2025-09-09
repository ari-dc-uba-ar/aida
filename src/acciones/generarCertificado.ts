import { Client } from 'pg'
import { readFile, writeFile } from 'node:fs/promises';
import { sqlLiteral } from '../cli'
import { DatoAtomico, FiltroAlumnos } from '../types';
import { aTexto, esFecha } from '../fechas'
import { PATH_PLANTILLA_CERTIFICADOS, PATH_CERTIFICADO_PARA_IMPRIMIR } from '../constantes'

async function obtenerAlumnoQueNecesitaCertificado(clientDb: Client, filtro:FiltroAlumnos):Promise<Record<string, (DatoAtomico)>|null>{
    const sql = `SELECT *
    FROM aida.alumnos
    WHERE titulo IS NOT NULL AND titulo_en_tramite IS NOT NULL
        ${`lu` in filtro ? `AND lu = ${sqlLiteral(filtro.lu)}` : ``}
        ${`fecha` in filtro ? `AND titulo_en_tramite = TO_DATE(${filtro.fecha}, YYYY-MM-DD)` : ``}
    ORDER BY egreso
	${`uno` in filtro ? `LIMIT 1` : ``}`;
    const res = await clientDb.query(sql)
    if (res.rows.length > 0){
        return res.rows[0];
    } else {
        return null;
    }
}


function pasarAStringODarErrorComoCorresponda(value:DatoAtomico){
    var result = value == null ? '' :
            typeof value == "string" ? value :
            esFecha(value) ? aTexto(value) :
            null;
    if (result == null){
        throw new Error('No se puede convertir a string el valor: ' + value);
    }
    return result;
}

async function generarCertificadoParaAlumno(pathPlantilla:string, alumno:Record<string, DatoAtomico>){
    let certificado = await readFile(pathPlantilla, { encoding: 'utf8' });
    for (const [key, value] of Object.entries(alumno)) {
        certificado = certificado.replace(
            `[#${key}]`,
            pasarAStringODarErrorComoCorresponda(value)
        );
    }
    await writeFile(PATH_CERTIFICADO_PARA_IMPRIMIR, certificado, 'utf-8');
    console.log('certificado impreso para alumno', alumno.lu);
}

async function generarCertificadoAlumno(clientDb:Client, filtro:FiltroAlumnos){
    var alumno = await obtenerAlumnoQueNecesitaCertificado(clientDb, filtro);
    if (alumno == null){
        console.log('No hay alumnos que necesiten certificado');
    } else {
        await generarCertificadoParaAlumno(PATH_PLANTILLA_CERTIFICADOS, alumno);
    }
}

export async function generarCertificadoAlumnoPrueba(clientDb:Client){
    return generarCertificadoAlumno(clientDb, {uno:true})
}

export async function generarCertificadoAlumnoLu(clientDb:Client, lu:string){
    return generarCertificadoAlumno(clientDb, {lu})
}


function esFechaValida(fecha: string): boolean {
    const fechaValidaRegex = /^\d{4}-\d{2}-\d{2}$/;
    return fechaValidaRegex.test(fecha)
  }

export async function generarCertificadoAlumnoFecha(clientDb:Client, fecha:string){
    if (!esFechaValida(fecha)){
        throw new Error("El formato de la fecha no es valido. Debes enviar YYYY-MM-DD");
    }

    return generarCertificadoAlumno(clientDb, {fecha})
}