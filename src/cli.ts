import { Client } from 'pg'

import { parametrosPrincipales } from './aida.js';

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