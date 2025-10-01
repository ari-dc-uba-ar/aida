import { watch } from 'fs/promises';
import * as Paht from 'path';
import { setImmediate } from 'timers/promises';

import { leerYParsearCsv } from './csv.js'
import { ListaDeEjecucion, orquestador } from './orquestador.js';
import { operacionesAida } from './aida.js'

const ARCHIVO_COMANDOS = 'generacion_certificados.csv';

async function obtenerListaEjeucionDeCsv(pathname:string){
    console.log('procesando', pathname)
    try {
        var {dataLines, columns} = await leerYParsearCsv(pathname);
        console.log('csv obtenido de', pathname, dataLines, columns)
    } catch (err) {
        throw err;
    }
    if (columns[0] != 'tipo' || columns[1] != 'parametro') {
        throw new Error('Las columnas del csv deben ser tipo y parametros pero son: '+JSON.stringify(columns))
    }
    var listaDeEjecucion:ListaDeEjecucion = dataLines.map(
        dataLine => ({operacion: dataLine[0]!, argumentos:[dataLine[1]!]})
    )
    return listaDeEjecucion
}

async function procesarGeneracionCertificados(pathname:string){
    const listaDeEjecucion = await obtenerListaEjeucionDeCsv(pathname);
    await orquestador(operacionesAida, listaDeEjecucion)
}

async function servidor(){
    if (process.env.AIDA_CARPETA_INTERCAMBIO == null) {
        throw new Error("Debe especificarse la variable de ambiente AIDA_CARPETA_INTERCAMBIO apuntando a una carpeta con subcarpetas entrada y salida ")
    }
    const CARPETA_OBSERVADA = Paht.join(process.env.AIDA_CARPETA_INTERCAMBIO,'entrada');
    const watcher = watch(CARPETA_OBSERVADA);
    for await (const event of watcher) {
        console.log('evento',event)
        if (event.filename == ARCHIVO_COMANDOS) {
            await procesarGeneracionCertificados(await setImmediate(Paht.join(CARPETA_OBSERVADA, event.filename)))
        }
    }
}

servidor();