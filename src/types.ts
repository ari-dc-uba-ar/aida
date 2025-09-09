import { Fecha } from './fechas'

export type DatoAtomico = string|Fecha|null;
export type FiltroAlumnos = {fecha: Fecha} | {lu: string} | {uno: true}
