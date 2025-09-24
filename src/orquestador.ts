import { Client } from 'pg';

export type DefinicionDeOperacion = {
    operacion:string,
    cantidadArgumentos:number,
    accion:(clientDb: Client, ...argumentos: string[]) => Promise<void>,
    descripcion?:string
    visible?:boolean
}

export type DefinicionesDeOperaciones = DefinicionDeOperacion[]

export type ElementoDeEjecucion = { operacion:string, argumentos:string[]}
export type ListaDeEjecucion = ElementoDeEjecucion[]

export async function orquestador(definicionOperaciones:DefinicionesDeOperaciones, listaDeEjecucion: ListaDeEjecucion){
    console.log('Por procesar', listaDeEjecucion);
    const clientDb = new Client()
    await clientDb.connect()
    for (const {operacion, argumentos} of listaDeEjecucion) {
        console.log('procesando', operacion);
        const infoParametro = definicionOperaciones.find(p => p.operacion == operacion);
        await infoParametro!.accion(clientDb,
            // @ts-ignore `...argumentos` se está pasando acá con ligereza
            ...argumentos
        )
    }
    await clientDb.end()
}