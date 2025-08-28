export interface Alumno {
  lu: number;
  apellido:string;
  nombres: string;
  titulo: string | null;
  titulo_en_tramite: string | null;
  egreso: Date;
}
