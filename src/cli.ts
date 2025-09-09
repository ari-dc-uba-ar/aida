import { Client } from 'pg'
import { readFile, writeFile } from 'node:fs/promises';
import { Fecha, aISO, aTexto, deTexto, esFecha } from './fechas.js'

async function leerYParsearCsv(filePath:string){
    const contents = await readFile(filePath, { encoding: 'utf8' });
    const header = contents.split(/\r?\n/)[0];
    if (header == null) throw new Error("archivo .csv vacio");
    const columns = header.split(',').map(col => col.trim());
    const dataLines = contents.split(/\r?\n/).slice(1).filter(line => line.trim() !== '');
    return {dataLines, columns};
}

type DatoAtomico = string|Fecha|null; // los tipos de los campos de las tablas del sistema

function sqlLiteral(value:DatoAtomico):string{
    const result = value == null ? `null` :
        typeof value == "string" ? `'` + value.replace(/'/g, `''`) + `'` :
        esFecha(value) ? sqlLiteral(aISO(value)) : undefined
    if (result == undefined) {
        console.error("sqlLiteral de tipo no reconocido",value)
        throw new Error("sqlLiteral de tipo no reconocido")
    }
    return result;
}

async function refrescarTablaAlumnos(clientDb: Client, listaDeAlumnosCompleta:string[], columnas:string[]){
    await clientDb.query("DELETE FROM aida.alumnos");
    for (const line of listaDeAlumnosCompleta) {
        const values = line.split(',');
        const query = `
            INSERT INTO aida.alumnos (${columnas.join(', ')}) VALUES
                (${values.map((value) => value == '' ? 'null' : sqlLiteral(value))})
        `;
        console.log(query)
        const res = await clientDb.query(query)
        console.log(res.command, res.rowCount)
    }
}

type FiltroAlumnos = {fecha: Fecha} | {lu: string} | {uno: true}

async function obtenerAlumnoQueNecesitaCertificado(clientDb: Client, filtro:FiltroAlumnos):Promise<Record<string, (DatoAtomico)>|null>{
    const sql = `SELECT *
    FROM aida.alumnos
    WHERE titulo IS NOT NULL AND titulo_en_tramite IS NOT NULL
        ${`lu` in filtro ? `AND lu = ${sqlLiteral(filtro.lu)}` : ``}
        ${`fecha` in filtro ? `AND titulo_en_tramite = ${sqlLiteral(filtro.fecha)}` : ``}
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
    await writeFile(`recursos/certificado-para-imprimir.html`, certificado, 'utf-8');
    console.log('certificado impreso para alumno', alumno.lu);
}

async function cargarNovedadesAlumnosDesdeCsv(clientDb:Client, archivoCsv:string){
    var {dataLines: listaDeAlumnosCompleta, columns: columnas} = await leerYParsearCsv(archivoCsv)
    await refrescarTablaAlumnos(clientDb, listaDeAlumnosCompleta, columnas);
}

async function generarCertificadoAlumno(clientDb:Client, filtro:FiltroAlumnos){
    var alumno = await obtenerAlumnoQueNecesitaCertificado(clientDb, filtro);
    if (alumno == null){
        console.log('No hay alumnos que necesiten certificado');
    } else {
        await generarCertificadoParaAlumno(`recursos/plantilla-certificado.html`, alumno);
    }
}

async function generarCertificadoAlumnoPrueba(clientDb:Client){
    return generarCertificadoAlumno(clientDb, {uno:true})
}

async function generarCertificadoAlumnoLu(clientDb:Client, lu:string){
    return generarCertificadoAlumno(clientDb, {lu})
}

async function generarCertificadoAlumnoFecha(clientDb:Client, fechaEnTexto:string){
    const fecha = deTexto(fechaEnTexto)
    return generarCertificadoAlumno(clientDb, {fecha})
}

const parametrosPrincipales = [
    {parametro: 'prueba-primero', cantidadArgumentos: 0, accion: generarCertificadoAlumnoPrueba},
    {parametro: 'archivo'       , cantidadArgumentos: 1, accion: cargarNovedadesAlumnosDesdeCsv},
    {parametro: 'fecha'         , cantidadArgumentos: 1, accion: generarCertificadoAlumnoFecha },
    {parametro: 'lu'            , cantidadArgumentos: 1, accion: generarCertificadoAlumnoLu    },
]

const prefijoParametro = '--';

function parsearParametros(){
    var i = 0;
    var parametrosEncontrados:{parametro:string, argumentos:string[]}[] = [];
    while (i < process.argv.length) {
        const elemento = process.argv[i]!;
        i++;
        if (elemento.startsWith(prefijoParametro)) {
            const parametro = elemento.slice(prefijoParametro.length);
            const infoParametro = parametrosPrincipales.find(p => p.parametro == parametro);
            if (infoParametro == null) throw new Error(`ERROR: parametro inexistente: ${parametro}`);
            const argumentos = process.argv.slice(i , i + infoParametro.cantidadArgumentos);
            parametrosEncontrados.push({parametro, argumentos});
        }
    }
    return parametrosEncontrados;
}

async function principal(){
    var listaDeEjecucion = parsearParametros();
    console.log('Por procesar', listaDeEjecucion);    
    const clientDb = new Client()
    await clientDb.connect()
    for (const {parametro, argumentos} of listaDeEjecucion) {
        console.log('procesando', parametro);
        const infoParametro = parametrosPrincipales.find(p => p.parametro == parametro);
        // @ts-ignore `...argumentos` se está pasando acá con ligereza
        await infoParametro!.accion(clientDb, ...argumentos)
    }
    await clientDb.end()
}

principal();