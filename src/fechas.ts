// workarrond de tipos opacos https://github.com/microsoft/TypeScript/issues/202#issuecomment-2052466141
const simboloParaOpacarFecha = Symbol("simboloParaOpacarFecha");

export interface Fecha {
    symbol: typeof simboloParaOpacarFecha
}

function tieneHoraCero(date:Date){
    return !(date.getHours() || date.getMinutes() || date.getSeconds() || date.getMilliseconds())
}

function deDate(date: Date): Fecha{
    if (!tieneHoraCero(date)) throw new Error("fecha invalidad");
    return date as unknown as Fecha;
}

function aDate(fecha: Fecha): Date{
    var date = fecha as unknown as Date;
    if (!tieneHoraCero(date)) throw new Error("fecha invalidad");
    return date;
}

export function aTexto(fecha: Fecha){
    return aDate(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export function aISO(fecha: Fecha){
    return aDate(fecha).toISOString().slice(0,10);
}

function deString(texto:string, separador:string, voltear:boolean){
    var partes = texto.split(separador).map(p => parseInt(p, 10)) as [number, number, number];
    if (partes.length != 3) throw new Error("fecha invalidad faltan o sobran partes o el separador es invalido");
    if (voltear) partes.reverse();
    return deDate(new Date(partes.join('-')));
}

export function deTexto(texto:string): Fecha{
    return deString(texto, '/', true)
}

export function deISO(texto:string): Fecha{
    return deString(texto, '-', false)
}

export function deCualquierTexto(texto:string): Fecha{
    return /-/.test(texto) ? deISO(texto) : deTexto(texto)
}

export function mismaFecha(fecha1:Fecha, fecha2:Fecha){
    return aDate(fecha1).getTime() == aDate(fecha2).getTime()
}

export function esFecha(fecha:any):fecha is Fecha{
    return fecha instanceof Date && tieneHoraCero(fecha);
}