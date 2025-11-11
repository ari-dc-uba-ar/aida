interface DatosPorTabla{
    tabla: string;
    text: string;
    crear: string;
    urlCreacion: string;
    campos: string[];
    urlEdicion: string;
    pk: string[];
}

export const DiccionariosTablas: DatosPorTabla[] = [
    {
        tabla: 'alumno',
        text: 'Alumnos',
        crear: 'Crear Alumno',
        urlCreacion: '/app/alumno/crearAlumno',
        campos: ['LU', 'Apellido', 'Nombres', 'Título', 'Título en trámite', 'Egreso'],
        urlEdicion: '/app/alumno/editarAlumno/',
        pk: ['lu']
    },
    {
        tabla: 'materia',
        text: 'Materias',
        crear: 'Crear Materia',
        urlCreacion: '/app/materia/crearMateria',
        campos: ['id_materia', 'nombre'],
        urlEdicion: '/app/materia/editarMateria/',
        pk: ['id_materia']
    },
    {
        tabla: 'carrera',
        text: 'Carreras',
        crear: 'Crear Carrera',
        urlCreacion: '/app/carrera/crearCarrera',
        campos: ['id_carrera', 'nombre'],
        urlEdicion: '/app/carrera/editarCarrera/',
        pk: ['id_carrera']
    },
    {
        tabla: 'materiasporcarrera',
        text: 'Materias por Carrera',
        crear: 'Crear Materia por Carrera',
        urlCreacion: '/app/materiasporcarrera/crearMateriasPorCarrera',
        campos: ['id_carrera', 'id_materia'],
        urlEdicion: '/app/materiasporcarrera/editarMateriasPorCarrera/',
        pk: ['id_carrera', 'id_materia']
    },
    {
        tabla: 'alumnosporcarrera',
        text: 'Alumnos por Carrera',
        crear: 'Crear Alumno por Carrera',
        urlCreacion: '/app/alumnosporcarrera/crearAlumnosPorCarrera',
        campos: ['lu', 'id_carrera'],
        urlEdicion: '/app/alumnosporcarrera/editarAlumnosPorCarrera/',
        pk: ['lu', 'id_carrera']
    },
    {
        tabla: 'cursada',
        text: 'Cursadas',
        crear: 'Crear Cursada',
        urlCreacion: '/app/cursada/crearCursada',
        campos: ['LU', 'id_materia', 'cuatrimestre', 'nota', 'profesor'],
        urlEdicion: '/app/cursada/editarCursada/',
        pk: ['lu', 'id_materia', 'cuatrimestre']
    }
];