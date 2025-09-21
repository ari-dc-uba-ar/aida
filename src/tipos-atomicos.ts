import { Fecha, aISO, aTexto, esFecha } from './fechas.js'

export type DatoAtomico = string|Fecha|null; // los tipos de los campos de las tablas del sistema

export function sqlLiteral(value:DatoAtomico):string{
    const result = value == null ? `null` :
        typeof value == "string" ? `'` + value.replace(/'/g, `''`) + `'` :
        esFecha(value) ? sqlLiteral(aISO(value)) : undefined
    if (result == undefined) {
        console.error("sqlLiteral de tipo no reconocido",value)
        throw new Error("sqlLiteral de tipo no reconocido")
    }
    return result;
}

export function datoATexto(value:DatoAtomico){
    var result = value == null ? '' :
            typeof value == "string" ? value :
            esFecha(value) ? aTexto(value) :
            null;
    if (result == null){
        throw new Error('No se puede convertir a string el valor: ' + value);
    }
    return result;
}
