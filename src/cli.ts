import { Client } from 'pg'
import { aISO, esFecha } from './fechas.js'
import { DatoAtomico } from 'types.js';
import { cargarNovedadesAlumnosDesdeCsv} from 'acciones/cargarNovedadesAlumnosDesdeCsv.js';
import { generarCertificadoAlumnoFecha, generarCertificadoAlumnoLu, generarCertificadoAlumnoPrueba } from 'acciones/generarCertificado.js';

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