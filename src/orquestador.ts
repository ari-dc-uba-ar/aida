import { Client } from 'pg';
import { Fecha, DatoAtomico } from './tipos-atomicos';

export type NombreDatoAtomico = 'string'|'Fecha'

export type NombreDelTipo<T extends DatoAtomico> =
    T extends string ? 'string' :
    T extends Fecha ? 'Fecha' :
    never

export type ParametroDeOperacion<T extends DatoAtomico> = {
    etiqueta: string,
    tipo: T
}

export type TipoDelArgumento<T extends {tipo:NombreDatoAtomico}> =
    T extends {tipo: 'string'} ? string :
    T extends {tipo: 'Fecha'} ? Fecha :
    never
/*
export type DefinicionDeOperacion<T extends Record<string, ParametroDeOperacion>> = {
    parametros:T,
    accion:(context:{clientDb: Client}, argumentos:{[K in keyof T]: TipoDelArgumento<T[K]>}) => Promise<void>,
    descripcion?:string
    visible?:boolean
}
*/

export type DefinicionDeOperacion<T extends Record<string, DatoAtomico>> = {
    parametros:{[K in keyof T]: ParametroDeOperacion<T[K]>},
    accion:(context:{clientDb: Client}, argumentos:T) => Promise<void>,
    descripcion?:string
    visible?:boolean
}



//export type DefinicionesDeOperaciones = Record<string, DefinicionDeOperacion<Record<string, ParametroDeOperacion>>>
export type DefinicionesDeOperaciones = Record<string, DefinicionDeOperacion<Record<string, DatoAtomico>>>

export type ElementoDeEjecucion<T extends DefinicionesDeOperaciones, O extends keyof T> = { operacion:O, argumentos:Parameters<T[O]['accion']>[1]}
export type ListaDeEjecucion<T extends DefinicionesDeOperaciones> = ElementoDeEjecucion<T, any>[]

export async function orquestador<D extends DefinicionesDeOperaciones>(definicionOperaciones:D, listaDeEjecucion: ListaDeEjecucion<D>){
    console.log('Por procesar', listaDeEjecucion);
    const clientDb = new Client()
    await clientDb.connect()
    for (const {operacion, argumentos} of listaDeEjecucion) {
        console.log('procesando', operacion);
        const infoParametro = definicionOperaciones[operacion];
        await infoParametro!.accion({clientDb}, argumentos)
    }
    await clientDb.end()
}