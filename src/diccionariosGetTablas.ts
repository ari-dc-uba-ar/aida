interface DatosPorTabla{
    tabla: string;
    id: string;
    text: string;
    crear: string;
    urlCreacion: string;
    campos: string[];
    urlEdicion: string;
    pk: string;
}

export const DiccionariosTablas: DatosPorTabla[] = [
    {
        tabla: 'alumno',
        id:'table-alumnos',
        text: 'Alumnos',
        crear: 'Crear Alumno',
        urlCreacion: '/app/alumno/crearAlumno',
        campos: ['LU', 'Apellido', 'Nombres', 'Título', 'Título en trámite', 'Egreso'],
        urlEdicion: '/app/alumno/editarAlumno/',
        pk: 'lu'
    }
];