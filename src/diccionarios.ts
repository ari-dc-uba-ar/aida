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
];

const CamposAlumno: Campos[] = [
    { id: 'lu', nombre: 'lu', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU' },
    { id: 'apellido', nombre: 'apellido', Titulo: 'Apellido', tipo: 'text', nuevoNombre: 'nuevoApellido' },
    { id: 'nombres', nombre: 'nombres', Titulo: 'Nombres', tipo: 'text', nuevoNombre: 'nuevoNombre' },
    { id: 'titulo', nombre: 'titulo', Titulo: 'Título', tipo: 'text', nuevoNombre: 'nuevoTitulo' },
    { id: 'titulo_en_tramite', nombre: 'titulo_en_tramite', Titulo: 'Título en Trámite', tipo: 'date', nuevoNombre: 'nuevoEstadoTramiteTitulo' },
    { id: 'egreso', nombre: 'egreso', Titulo: 'Fecha de Egreso', tipo: 'date', nuevoNombre: 'nuevaFechaDeEgreso' }
];

const CamposPorTabla: CamposPorTabla[] = [
    {
        tabla: 'alumno', campos: CamposAlumno}
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
];

//INTERFACES Y DICCIONARIOS PARA EDITAR GENERICO
interface TituloEditarPorTabla{
    tabla: string;
    TituloEditar: string;
}

interface CamposParaEditar{
    id: string;
    nombre: string;
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
    { tabla: 'alumno', TituloEditar: 'editarAlumno' },
];

const CamposParaEditarAlumno: CamposParaEditar[] = [
    { id: 'lu', nombre: 'lu', Titulo: 'LU', tipo: 'text', nuevoNombre: 'nuevaLU', placeholder: '', disabled: true },
    { id: 'apellido', nombre: 'apellido', Titulo: 'Apellido', tipo: 'text', nuevoNombre: 'nuevoApellido', placeholder: 'Apellido del Alumno', disabled: false },
    { id: 'nombres', nombre: 'nombres', Titulo: 'Nombres', tipo: 'text', nuevoNombre: 'nuevoNombre', placeholder: 'Nombres del Alumno', disabled: false },
    { id: 'titulo', nombre: 'titulo', Titulo: 'Título', tipo: 'text', nuevoNombre: 'nuevoTitulo', placeholder: 'Título del Alumno', disabled: false },
    { id: 'titulo_en_tramite', nombre: 'titulo_en_tramite', Titulo: 'Título en Trámite', tipo: 'date', nuevoNombre: 'nuevoEstadoTramiteTitulo', placeholder: 'YYYY-MM-DD', disabled: false },
    { id: 'egreso', nombre: 'egreso', Titulo: 'Fecha de Egreso', tipo: 'date', nuevoNombre: 'nuevaFechaDeEgreso', placeholder: 'YYYY-MM-DD', disabled: false }
];

const CamposParaEditarPorTabla: CamposParaEditarPorTabla[] = [
    {tabla: 'alumno', campos: CamposParaEditarAlumno}
];

const CamposParaCargarAlumno: camposParaCargar[] = [
    { id: 'lu', nombreActual: 'lu_actual', nuevoNombre: 'nuevaLU', fecha: false },
    { id: 'apellido', nombreActual: 'apellido_actual', nuevoNombre: 'nuevoApellido', fecha: false },
    { id: 'nombres', nombreActual: 'nombres_actual', nuevoNombre: 'nuevoNombre', fecha: false },
    { id: 'titulo', nombreActual: 'titulo_actual', nuevoNombre: 'nuevoTitulo', fecha: false },
    { id: 'titulo_en_tramite', nombreActual: 'titulo_en_tramite_actual', nuevoNombre: 'nuevoEstadoTramiteTitulo', fecha: true },
    { id: 'egreso', nombreActual: 'egreso_actual', nuevoNombre: 'nuevaFechaDeEgreso', fecha: true }
];
const CargarDatos: cargarDatosIniciales[] = [
    {
        tabla: 'alumno', campos: CamposParaCargarAlumno
    },
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