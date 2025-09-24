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

async function cargar(parametro:string, clientDb: Client):Promise<void>{
    const filePath:string = parametro;
    var {dataLines: listaDeAlumnosCompleta, columns: columnas} = await leerYParsearCsv(filePath)
    for (const line of listaDeAlumnosCompleta) {
        const values:string[] = line.split(',');

        const query:string = `
            INSERT INTO aida.alumnos (${columnas.join(', ')})
            VALUES (${values.map(v => v === '' ? 'null' : `'${v}'`).join(', ')})
            ON CONFLICT (lu) DO NOTHING`;

        console.log(query)
    await clientDb.query(query);
    }
}

async function obtenerAlumnoConLu(clientDb: Client, luAlumno: string):Promise<Alumno|null> {
        const sql: string = `
    SELECT * FROM aida.alumnos
    WHERE
    titulo IS NOT NULL AND
    titulo_en_tramite IS NOT NULL AND
    lu = $1`;

    const res: QueryResult<Alumno> = await clientDb.query(sql, [luAlumno]);

    if (res.rows.length > 0){
        return res.rows[0];
    } else {
        return null;
    }

}


async function obtenerCertificadoParaLU(clientDb: Client, parametro: string):Promise<void>{
    const luAlumno = parametro;
    var alumno: Alumno|null = await obtenerAlumnoConLu(clientDb, luAlumno);
    if (alumno == null){
        console.log('No hay alumno con LU:', luAlumno, 'que necesite certificado');
    } else {
        await generarCertificadoParaAlumno(`recursos/plantilla-certificado.html`, alumno);
        await guardarCertificadoEnCarpetaSalida(alumno.lu);
    }

}

async function guardarCertificadoEnCarpetaSalida(luAlumno: string){

    const luConGuionBajo = luAlumno.replace(/[\/]/g, "_");
    const certificado = await readFile(`recursos/certificado-para-imprimir.html`, { encoding: 'utf8' });
    await writeFile(`outputs/certificados/certificadoDe${luConGuionBajo}.html`, certificado, 'utf-8');
}


async function obtenerAlumnosConFechaDeTramite(clientDb: Client, fechaDeTramite: string){

    const sql: string = `
    SELECT * FROM aida.alumnos
    WHERE
    titulo IS NOT NULL AND
    titulo_en_tramite IS NOT NULL AND
    titulo_en_tramite = $1`;

    const res: QueryResult<Alumno> = await clientDb.query(sql, [fechaDeTramite]);


    if (res.rows.length > 0){
        return res;
    } else {
        return null;
    }

}


async function generarCertificadosParaFecha(clientDb: Client, parametro: string){
    const fechaDeTramite = parametro;
    const alumnos = await obtenerAlumnosConFechaDeTramite(clientDb, fechaDeTramite)

    if (alumnos == null){
        console.log('No hay alumno con fecha de tramite:', fechaDeTramite, 'que necesite certificado');
    }

    else{
        for (const alumno of alumnos.rows){
            await generarCertificadoParaAlumno(`recursos/plantilla-certificado.html`, alumno);
            await guardarCertificadoEnCarpetaSalida(alumno.lu);
        }
        console.log('Certificados generados para fecha de tramite:', fechaDeTramite, "guardados en carpeta outputs/certificados");
    }
}

async function ejecutarComando(clientDb: Client, comando:string, parametro:string):Promise<void>{
    if (comando !== undefined && parametro !== undefined){
        if (comando === 'fecha'){
            await generarCertificadosParaFecha(clientDb, parametro)
        }

        else if (comando === 'lu'){
            await obtenerCertificadoParaLU(clientDb, parametro)
        }

    }
}

async function generacion_certificados(clientDb: Client, filePath:string):Promise<void>{
    const contents:string = await readFile(filePath, { encoding: 'utf8' });
    const dataLines:string[] = contents.split(/\r?\n/).slice(1).filter(line => line.trim() !== '');
    let i = 0;
    while(i < dataLines.length){
        const [comando, parametro] = dataLines[i].split(',');
        console.log("Ejecutando comando:", comando, "con parametro:", parametro, "linea:", i, "tamaño total:", dataLines.length);
        await ejecutarComando(clientDb, comando, parametro);
        i++;
    }
}

async function cliComandos(clientDb: Client, filePath:string):Promise<void>{
    const comando = process.argv[process.argv.length-2];
    const parametro = process.argv[process.argv.length-1];
    if (comando === 'cargar'){
            await cargar(parametro,clientDb)
    }
    else if (comando === 'generacion_certificados'){
            await generacion_certificados(clientDb, filePath)
    }
    else{
        console.error('Comando no reconocido. Use "cargar <ruta_del_csv>" o "generacion_certificados <ruta_del_csv>"');
    }
}


async function principal():Promise<void>{
    const clientDb:Client = new Client()
    const filePath:string = `recursos/alumnos.csv`;
    await clientDb.connect()
    /*var {dataLines: listaDeAlumnosCompleta, columns: columnas} = await leerYParsearCsv(filePath)
    await refrescarTablaAlumnos(clientDb, listaDeAlumnosCompleta, columnas);
    var alumno: Alumno|null = await obtenerPrimerAlumnoQueNecesitaCertificado(clientDb);
    if (alumno == null){
        console.log('No hay alumnos que necesiten certificado');
    } else {
        await generarCertificadoParaAlumno(`recursos/plantilla-certificado.html`, alumno);
    }*/
    const filePath2:string = `trabajo/generacion_certificados.csv`
    await cliComandos(clientDb, filePath2);

    await clientDb.end()

}


principal()
