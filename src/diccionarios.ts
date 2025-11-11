//INTERFACES Y DICCIONARIOS PARA CREAR GENERICO
interface TituloPorTabla{
    tabla: string;
    Titulo: string;
}

interface CamposPorTabla{
    tabla: string;
    campos: Campos[];
}

interface Campos{
    id: string;
    nombre: string;
    Titulo: string;
    tipo: string;
    nuevoNombre: string;
}

interface CamposMateria{
    id_materia: string;
    nombre: string;
}

interface InicializarDatos{
    tabla: string;
    campos: {[key: string]: string};
}

interface DatosCreadosPorTabla{
    tabla: string;
    datosCreados: {[key: string]: any};
}

const TituloPorTabla: TituloPorTabla[] = [
    { tabla: 'alumno', Titulo: 'Crear nuevo Alumno' },
    { tabla: 'materia', Titulo: 'Crear nueva Materia' },
    { tabla: 'carrera', Titulo: 'Crear nueva Carrera' },
    { tabla: 'materiasporcarrera', Titulo: 'Crear nueva Materia por Carrera' },
    { tabla: 'alumnosporcarrera', Titulo: 'Crear nuevo Alumno por Carrera' },
    { tabla: 'cursada', Titulo: 'Crear nueva Cursada' }
];

const CamposAlumno: Campos[] = [
    { id: 'lu', nombre: 'lu', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU' },
    { id: 'apellido', nombre: 'apellido', Titulo: 'Apellido', tipo: 'text', nuevoNombre: 'nuevoApellido' },
    { id: 'nombres', nombre: 'nombres', Titulo: 'Nombres', tipo: 'text', nuevoNombre: 'nuevoNombre' },
    { id: 'titulo', nombre: 'titulo', Titulo: 'Título', tipo: 'text', nuevoNombre: 'nuevoTitulo' },
    { id: 'titulo_en_tramite', nombre: 'titulo_en_tramite', Titulo: 'Título en Trámite', tipo: 'date', nuevoNombre: 'nuevoEstadoTramiteTitulo' },
    { id: 'egreso', nombre: 'egreso', Titulo: 'Fecha de Egreso', tipo: 'date', nuevoNombre: 'nuevaFechaDeEgreso' }
];

const CamposMateria: Campos[] = [
    { id: 'id_materia', nombre: 'id_materia', Titulo: 'ID Materia', tipo: 'text', nuevoNombre: 'nuevoIdMateria' },
    { id: 'nombre', nombre: 'nombre', Titulo: 'Nombre', tipo: 'text', nuevoNombre: 'nuevoNombre' }
];

const CamposCarrera: Campos[] = [
    { id: 'id_carrera', nombre: 'id_carrera', Titulo: 'ID Carrera', tipo: 'text', nuevoNombre: 'nuevoIdCarrera' },
    { id: 'nombre', nombre: 'nombre', Titulo: 'Nombre', tipo: 'text', nuevoNombre: 'nuevoNombre' }
];

const CamposMateriasPorCarrera: Campos[] = [
    { id: 'id_carrera', nombre: 'id_carrera', Titulo: 'ID Carrera', tipo: 'text', nuevoNombre: 'nuevoIdCarrera' },
    { id: 'id_materia', nombre: 'id_materia', Titulo: 'ID Materia', tipo: 'text', nuevoNombre: 'nuevoIdMateria' }
];

const CamposAlumnosPorCarrera: Campos[] = [
    { id: 'lu', nombre: 'lu', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU' },
    { id: 'id_carrera', nombre: 'id_carrera', Titulo: 'ID Carrera', tipo: 'text', nuevoNombre: 'nuevoIdCarrera' }
];

const CamposCursada: Campos[] = [
    { id: 'lu', nombre: 'lu', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU' },
    { id: 'id_materia', nombre: 'id_materia', Titulo: 'ID Materia', tipo: 'text', nuevoNombre: 'nuevoIdMateria' },
    { id: 'cuatrimestre', nombre: 'cuatrimestre', Titulo: 'Cuatrimestre', tipo: 'text', nuevoNombre: 'nuevoCuatrimestre' },
    { id: 'nota', nombre: 'nota', Titulo: 'Nota', tipo: 'number', nuevoNombre: 'nuevaNota' },
    { id: 'profesor', nombre: 'profesor', Titulo: 'Profesor', tipo: 'text', nuevoNombre: 'nuevoProfesor' }
];

const CamposPorTabla: CamposPorTabla[] = [
    {tabla: 'alumno', campos: CamposAlumno},
    {tabla: 'materia', campos: CamposMateria},
    {tabla: 'carrera', campos: CamposCarrera},
    {tabla: 'materiasporcarrera', campos: CamposMateriasPorCarrera},
    {tabla: 'alumnosporcarrera', campos: CamposAlumnosPorCarrera},
    {tabla: 'cursada', campos: CamposCursada}
];

const InicializarDatosPorTabla: InicializarDatos[] = [
    {
        tabla: 'alumno', campos: {
            nuevaLU: '',
            nuevoApellido: '',
            nuevoNombre: '',
            nuevoTitulo: '',
            nuevoEstadoTramiteTitulo: 'dd/mm/yy',
            nuevaFechaDeEgreso: 'dd/mm/yy'
        }
    },
    {
        tabla: 'materia', campos: {
            nuevoIdMateria: '',
            nuevoNombre: ''
        }
    },
    {
        tabla: 'carrera', campos: {
            nuevoIdCarrera: '',
            nuevoNombre: ''
        }
    },
    {
        tabla: 'materiasporcarrera', campos: {
            nuevoIdCarrera: '',
            nuevoIdMateria: ''
        }
    },
    {
        tabla: 'alumnosporcarrera', campos: {
            nuevaLU: '',
            nuevoIdCarrera: ''
        }
    },
    {
        tabla: 'cursada', campos: {
            nuevaLU: '',
            nuevoIdMateria: '',
            nuevoCuatrimestre: '',
            nuevaNota: '',
            nuevoProfesor: ''
        }
    }
];

const DatosCreadosPorTabla: DatosCreadosPorTabla[] = [
    {
        tabla: 'alumno', datosCreados: {
            lu: '',
            apellido: '',
            nombres: '',
            titulo: '',
            titulo_en_tramite: null,
            egreso: null
        }
    },
    {
        tabla: 'materia', datosCreados: {
            id_materia: '',
            nombre: ''
        }
    },
    {
        tabla: 'carrera', datosCreados: {
            id_carrera: '',
            nombre: ''
        }
    },
    {
        tabla: 'materiasporcarrera', datosCreados: {
            id_carrera: '',
            id_materia: ''
        }
    },
    {
        tabla: 'alumnosporcarrera', datosCreados: {
            lu: '',
            id_carrera: ''
        }
    },
    {
        tabla: 'cursada', datosCreados: {
            lu: '',
            id_materia: '',
            cuatrimestre: '',
            nota: '',
            profesor: ''
        }
    }
];

//INTERFACES Y DICCIONARIOS PARA EDITAR GENERICO
interface TituloEditarPorTabla{
    tabla: string;
    TituloEditar: string;
}

interface CamposParaEditar{
    id: string;
    nombre: string;
    nombreActual: string;
    Titulo: string;
    tipo: string;
    nuevoNombre: string;
    placeholder: string;
    disabled: boolean;
}

interface CamposParaEditarPorTabla{
    tabla: string;
    campos: CamposParaEditar[];
}

interface camposParaCargar{
    id: string
    nombreActual: string;
    nuevoNombre: string;
    fecha: boolean;
}

interface cargarDatosIniciales{
    tabla: string;
    campos: camposParaCargar[];
}

interface DatosEditadosPorTabla{
    tabla: string;
    datosEditados: {[key: string]: any};
}

const TituloEditarPorTabla: TituloEditarPorTabla[] = [
    { tabla: 'alumno', TituloEditar: 'Editar datos de Alumno'},
    { tabla: 'materia', TituloEditar: 'Editar datos de Materia'},
    { tabla: 'carrera', TituloEditar: 'Editar datos de Carrera'},
    { tabla: 'materiasporcarrera', TituloEditar: 'Editar datos de Materia por Carrera'},
    { tabla: 'alumnosporcarrera', TituloEditar: 'Editar datos de Alumno por Carrera'},
    { tabla: 'cursada', TituloEditar: 'Editar datos de Cursada'}
];

const CamposParaEditarAlumno: CamposParaEditar[] = [
    { id: 'lu', nombre: 'lu', nombreActual: 'lu_actual', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU', placeholder: '', disabled: true },
    { id: 'apellido', nombre: 'apellido', nombreActual: 'apellido_actual', Titulo: 'Apellido', tipo: 'text', nuevoNombre: 'nuevoApellido', placeholder: 'Apellido del Alumno', disabled: false },
    { id: 'nombres', nombre: 'nombres', nombreActual: 'nombres_actual', Titulo: 'Nombres', tipo: 'text', nuevoNombre: 'nuevoNombre', placeholder: 'Nombres del Alumno', disabled: false },
    { id: 'titulo', nombre: 'titulo', nombreActual: 'titulo_actual', Titulo: 'Título', tipo: 'text', nuevoNombre: 'nuevoTitulo', placeholder: 'Título del Alumno', disabled: false },
    { id: 'titulo_en_tramite', nombre: 'titulo_en_tramite', nombreActual: 'titulo_en_tramite_actual', Titulo: 'Título en Trámite', tipo: 'date', nuevoNombre: 'nuevoEstadoTramiteTitulo', placeholder: 'YYYY-MM-DD', disabled: false },
    { id: 'egreso', nombre: 'egreso', nombreActual: 'egreso_actual', Titulo: 'Fecha de Egreso', tipo: 'date', nuevoNombre: 'nuevaFechaDeEgreso', placeholder: 'YYYY-MM-DD', disabled: false }
];

const CamposParaEditarMateria: CamposParaEditar[] = [
    { id: 'id_materia', nombre: 'id_materia', nombreActual: 'id_materia_actual', Titulo: 'ID Materia', tipo: 'text', nuevoNombre: 'nuevoIdMateria', placeholder: '', disabled: true },
    { id: 'nombre', nombre: 'nombre', nombreActual: 'nombre_actual', Titulo: 'Nombre', tipo: 'text', nuevoNombre: 'nuevoNombre', placeholder: 'Nombre de la Materia', disabled: false }
];

const CamposParaEditarCarrera: CamposParaEditar[] = [
    { id: 'id_carrera', nombre: 'id_carrera', nombreActual: 'id_carrera_actual', Titulo: 'ID Carrera', tipo: 'text', nuevoNombre: 'nuevoIdCarrera', placeholder: '', disabled: true },
    { id: 'nombre', nombre: 'nombre', nombreActual: 'nombre_actual', Titulo: 'Nombre', tipo: 'text', nuevoNombre: 'nuevoNombre', placeholder: 'Nombre de la Carrera', disabled: false }
];

const CamposParaEditarMateriasPorCarrera: CamposParaEditar[] = [
    { id: 'id_carrera', nombre: 'id_carrera', nombreActual: 'id_carrera_actual', Titulo: 'ID Carrera', tipo: 'text', nuevoNombre: 'nuevoIdCarrera', placeholder: '', disabled: true },
    { id: 'id_materia', nombre: 'id_materia', nombreActual: 'id_materia_actual', Titulo: 'ID Materia', tipo: 'text', nuevoNombre: 'nuevoIdMateria', placeholder: '', disabled: true }
];

const CamposParaEditarAlumnosPorCarrera: CamposParaEditar[] = [
    { id: 'lu', nombre: 'lu', nombreActual: 'lu_actual', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU', placeholder: '', disabled: true },
    { id: 'id_carrera', nombre: 'id_carrera', nombreActual: 'id_carrera_actual', Titulo: 'ID Carrera', tipo: 'text', nuevoNombre: 'nuevoIdCarrera', placeholder: '', disabled: true }
];

const CamposParaEditarCursada: CamposParaEditar[] = [
    { id: 'lu', nombre: 'lu', nombreActual: 'lu_actual', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU', placeholder: '', disabled: true },
    { id: 'id_materia', nombre: 'id_materia', nombreActual: 'id_materia_actual', Titulo: 'ID Materia', tipo: 'text', nuevoNombre: 'nuevoIdMateria', placeholder: '', disabled: true },
    { id: 'cuatrimestre', nombre: 'cuatrimestre', nombreActual: 'cuatrimestre_actual', Titulo: 'Cuatrimestre', tipo: 'text', nuevoNombre: 'nuevoCuatrimestre', placeholder: 'Cuatrimestre de la Cursada', disabled: true },
    { id: 'nota', nombre: 'nota', nombreActual: 'nota_actual', Titulo: 'Nota', tipo: 'number', nuevoNombre: 'nuevaNota', placeholder: 'Nota Obtenida', disabled: false },
    { id: 'profesor', nombre: 'profesor', nombreActual: 'profesor_actual', Titulo: 'Profesor', tipo: 'text', nuevoNombre: 'nuevoProfesor', placeholder: 'Nombre del Profesor', disabled: false }
];

const CamposParaEditarPorTabla: CamposParaEditarPorTabla[] = [
    {tabla: 'alumno', campos: CamposParaEditarAlumno},
    {tabla: 'materia', campos: CamposParaEditarMateria},
    {tabla: 'carrera', campos: CamposParaEditarCarrera},
    {tabla: 'materiasporcarrera', campos: CamposParaEditarMateriasPorCarrera},
    {tabla: 'alumnosporcarrera', campos: CamposParaEditarAlumnosPorCarrera},
    {tabla: 'cursada', campos: CamposParaEditarCursada}
];

const CamposParaCargarAlumno: camposParaCargar[] = [
    { id: 'lu', nombreActual: 'lu_actual', nuevoNombre: 'nuevaLU', fecha: false },
    { id: 'apellido', nombreActual: 'apellido_actual', nuevoNombre: 'nuevoApellido', fecha: false },
    { id: 'nombres', nombreActual: 'nombres_actual', nuevoNombre: 'nuevoNombre', fecha: false },
    { id: 'titulo', nombreActual: 'titulo_actual', nuevoNombre: 'nuevoTitulo', fecha: false },
    { id: 'titulo_en_tramite', nombreActual: 'titulo_en_tramite_actual', nuevoNombre: 'nuevoEstadoTramiteTitulo', fecha: true },
    { id: 'egreso', nombreActual: 'egreso_actual', nuevoNombre: 'nuevaFechaDeEgreso', fecha: true }
];

const CamposParaCargarMateria: camposParaCargar[] = [
    { id: 'id_materia', nombreActual: 'id_materia_actual', nuevoNombre: 'nuevoIdMateria', fecha: false },
    { id: 'nombre', nombreActual: 'nombre_actual', nuevoNombre: 'nuevoNombre', fecha: false }
];

const CamposParaCargarCarrera: camposParaCargar[] = [
    { id: 'id_carrera', nombreActual: 'id_carrera_actual', nuevoNombre: 'nuevoIdCarrera', fecha: false },
    { id: 'nombre', nombreActual: 'nombre_actual', nuevoNombre: 'nuevoNombre', fecha: false }
];

const CamposParaCargarMateriasPorCarrera: camposParaCargar[] = [
    { id: 'id_carrera', nombreActual: 'id_carrera_actual', nuevoNombre: 'nuevoIdCarrera', fecha: false },
    { id: 'id_materia', nombreActual: 'id_materia_actual', nuevoNombre: 'nuevoIdMateria', fecha: false }
];

const CamposParaCargarAlumnosPorCarrera: camposParaCargar[] = [
    { id: 'lu', nombreActual: 'lu_actual', nuevoNombre: 'nuevaLU', fecha: false },
    { id: 'id_carrera', nombreActual: 'id_carrera_actual', nuevoNombre: 'nuevoIdCarrera', fecha: false }
];

const CamposParaCargarCursada: camposParaCargar[] = [
    { id: 'lu', nombreActual: 'lu_actual', nuevoNombre: 'nuevaLU', fecha: false },
    { id: 'id_materia', nombreActual: 'id_materia_actual', nuevoNombre: 'nuevoIdMateria', fecha: false },
    { id: 'cuatrimestre', nombreActual: 'cuatrimestre_actual', nuevoNombre: 'nuevoCuatrimestre', fecha: false },
    { id: 'nota', nombreActual: 'nota_actual', nuevoNombre: 'nuevaNota', fecha: false },
    { id: 'profesor', nombreActual: 'profesor_actual', nuevoNombre: 'nuevoProfesor', fecha: false }
];

const CargarDatos: cargarDatosIniciales[] = [
    {
        tabla: 'alumno', campos: CamposParaCargarAlumno
    },
    {
        tabla: 'materia', campos: CamposParaCargarMateria
    },
    {
        tabla: 'carrera', campos: CamposParaCargarCarrera
    },
    {
        tabla: 'materiasporcarrera', campos: CamposParaCargarMateriasPorCarrera
    },
    {
        tabla: 'alumnosporcarrera', campos: CamposParaCargarAlumnosPorCarrera
    },
    {
        tabla: 'cursada', campos: CamposParaCargarCursada
    }
];

const DatosEditadosPorTabla: DatosEditadosPorTabla[] = [
    {
        tabla: 'alumno', datosEditados: {
            lu: '',
            apellido: '',
            nombres: '',
            titulo: '',
            titulo_en_tramite: null,
            egreso: null
        }
    },
    {
        tabla: 'materia', datosEditados: {
            id_materia: '',
            nombre: ''
        }
    },
    {
        tabla: 'carrera', datosEditados: {
            id_carrera: '',
            nombre: ''
        }
    },
    {
        tabla: 'materiasporcarrera', datosEditados: {
            id_carrera: '',
            id_materia: ''
        }
    },
    {
        tabla: 'alumnosporcarrera', datosEditados: {
            lu: '',
            id_carrera: ''
        }
    },
    {
        tabla: 'cursada', datosEditados: {
            lu: '',
            id_materia: '',
            cuatrimestre: '',
            nota: '',
            profesor: ''
        }
    },
];

//LLAMADAS GLOBALES

(window as any).TituloPorTabla = TituloPorTabla;
(window as any).CamposPorTabla = CamposPorTabla;
(window as any).InicializarDatosPorTabla = InicializarDatosPorTabla;
(window as any).DatosCreadosPorTabla = DatosCreadosPorTabla;
(window as any).TituloEditarPorTabla = TituloEditarPorTabla;
(window as any).CamposParaEditarPorTabla = CamposParaEditarPorTabla;
(window as any).CargarDatos = CargarDatos;
(window as any).DatosEditadosPorTabla = DatosEditadosPorTabla;