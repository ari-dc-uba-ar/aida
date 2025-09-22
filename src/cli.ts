import { ListaDeEjecucion, orquestador } from './orquestador.js';
import { operacionesAida } from './aida.js';

const prefijoParametro = '--';

function parsearParametros(){
    var i = 0;
    var listaDeEjecucion:ListaDeEjecucion = [];
    while (i < process.argv.length) {
        const elemento = process.argv[i]!;
        i++;
        if (elemento.startsWith(prefijoParametro)) {
            const operacion = elemento.slice(prefijoParametro.length);
            const infoOperacion = operacionesAida.find(p => p.operacion == operacion);
            if (infoOperacion == null) throw new Error(`ERROR: parametro inexistente: ${operacion}`);
            const argumentos = process.argv.slice(i , i + infoOperacion.cantidadArgumentos);
            listaDeEjecucion.push({operacion, argumentos});
        }
    }
    return listaDeEjecucion;
}

async function principal(){
    var listaDeEjecucion = parsearParametros();
    orquestador(operacionesAida, listaDeEjecucion)
}

principal();