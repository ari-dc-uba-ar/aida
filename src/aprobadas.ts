import 'dotenv/config';
import {Client} from "pg";
import { generarCertificadoAlumnoLu } from './aida.js';
import { enviarMail } from './mail.js';

// Este chequeo se hace solo al crear una cursada porque se asume que las notas se cargan bien
export async function chequearCantidadAprobadas(lu: string): Promise<string> {
    const queryVerAprobadasPorAlumno = `
        SELECT COUNT(nota) AS cantidad_aprobadas
        FROM aida.cursada
        WHERE lu = $1 AND nota >= 4
    `;
    const QueryVerMateriasEnCarrera = `
        SELECT COUNT(id_materia) AS cantidad_materias
        FROM aida.materiasporcarrera
        WHERE id_carrera = (
            SELECT id_carrera
            FROM aida.alumnosporcarrera
            WHERE lu = $1
        )
    `;

    const QueryActualizarEgreso = `
        UPDATE aida.alumnos
            SET
                titulo_en_tramite = $1,
                egreso = $1
            WHERE lu = $2
    `;

    const QueryGetMailYTituloAlumno = `
            SELECT aida.alumnos.mail, aida.alumnos.titulo
            FROM aida.alumnos
            WHERE lu = $1
        `;

    const clientDb = new Client({ connectionString: process.env.DATABASE_URL });
    await clientDb.connect();
    const VerAprobadas = await clientDb.query(queryVerAprobadasPorAlumno, [lu]);
    const VerMateriasEnCarrera = await clientDb.query(QueryVerMateriasEnCarrera, [lu]);
    let resultado = '';
    const cantidadAprobadas = parseInt(VerAprobadas.rows[0].cantidad_aprobadas, 10);
    const CantidadMateriasEnCarrera = parseInt(VerMateriasEnCarrera.rows[0].cantidad_materias, 10);
    if (cantidadAprobadas == CantidadMateriasEnCarrera){
        const fechaDeHoy = new Date().toISOString()
        await clientDb.query(QueryActualizarEgreso, [fechaDeHoy, lu]);
        resultado += await generarCertificadoAlumnoLu(clientDb, lu);
        // enviar mail
        const datosAlumno = await clientDb.query(QueryGetMailYTituloAlumno, [lu]);
        const mail = datosAlumno.rows[0].mail;
        const titulo = datosAlumno.rows[0].titulo;
        await enviarMail(mail, resultado, titulo);
    };
    await clientDb.end();
    return resultado
}