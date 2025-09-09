// workarrond de tipos opacos https://github.com/microsoft/TypeScript/issues/202#issuecomment-2052466141
const simboloParaOpacarFecha = Symbol("simboloParaOpacarFecha");

// export type Fecha = typeof simboloParaOpacarFecha;

export interface Fecha {
    symbol: typeof simboloParaOpacarFecha
}

function deDate(date: Date): Fecha{
    if (date.getHours() || date.getMinutes() || date.getSeconds() || date.getMilliseconds()) throw new Error("fecha invalidad");
    return date as unknown as Fecha;
}

function aDate(fecha: Fecha): Date{
    var date = fecha as unknown as Date;
    if (date.getHours() || date.getMinutes() || date.getSeconds() || date.getMilliseconds()) throw new Error("fecha invalidad");
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

export function mismaFecha(fecha1:Fecha, fecha2:Fecha){
    return aDate(fecha1).getTime() == aDate(fecha2).getTime()
}