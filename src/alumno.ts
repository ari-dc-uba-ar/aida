//import { Client } from "pg";

function dom(tag:string, attrs?:Record<string, string>, children?:(HTMLElement|Text)[]) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
        el.setAttribute(key, value);
    }
    for (const child of children || []) {
        el.appendChild(child);
    }
    return el;
}

function text(text:string) {
    return document.createTextNode(text);
}

function cel(row:HTMLTableRowElement, textContent:string|undefined) {
    var celda = row.insertCell();
    celda.textContent = textContent || '-';
    return celda;
}

async function EditarAlumno(alumno: any){
    return alumno;
}

window.addEventListener('load', async function() {
    document.body.innerHTML = ``;
    var table = dom('table', {id:'table-alumnos'}, []) as HTMLTableElement;
    var main = dom('div', {className:'main'}, [
        dom('h1', {}, [text('Alumnos')]),
        table
    ]);
    document.body.appendChild(main);


    var botonCrear = dom('button', { class: 'boton-crear', type: 'button' }, [text('Crear Alumno')]) as HTMLButtonElement;
    botonCrear.onclick = () => {
        const urlCreacion = `/app/alumno/crearAlumno`;
        console.log(`Abriendo ventana para crear un Alumno`);
        window.location.href = urlCreacion;
    };

    main.appendChild(document.createElement('br'));
    main.appendChild(botonCrear);
    var row = table.insertRow();
    cel(row, 'LU');
    cel(row, 'Apellido');
    cel(row, 'Nombres');
    cel(row, 'Título');
    cel(row, 'Título en trámite');
    cel(row, 'Egreso');
    var req = await fetch('http://localhost:3000/api/v0/alumno/');
    var data = await req.json();
    console.log(data);
    data.forEach((alumno:Record<string, string>) => {
        var row = table.insertRow();
        cel(row, alumno.lu);
        cel(row, alumno.apellido);
        cel(row, alumno.nombres);
        cel(row, alumno.titulo);
        cel(row, alumno.titulo_en_tramite);
        cel(row, alumno.egreso);

        var celdaEditar = row.insertCell();
        var botonEditar = dom('button', { class: 'boton-editar' }, [text('Editar')]) as HTMLButtonElement;

        botonEditar.onclick = () => {
            const alumnoLU: any = alumno.lu;
            const luCodificado = encodeURIComponent(alumnoLU);
            const urlEdicion = `/app/alumno/editarAlumno/${luCodificado}`;
            console.log(`Abriendo ventana para editar al alumno ID: ${alumnoLU}`);
            window.location.href = urlEdicion;
        };

        celdaEditar.appendChild(botonEditar);

        var celdaBorrar = row.insertCell();
        var botonBorrar = dom('button', { class: 'boton-borrar', type: 'button' }, [text('Borrar')]) as HTMLButtonElement;

        botonBorrar.onclick = async () => {
            const alumnoLU: any = alumno.lu;
            console.log(`Borrando al Alumno: ${alumnoLU}`);
            try{
                var req = await fetch('http://localhost:3000/api/v0/alumno/' + encodeURIComponent(alumnoLU), {
                    method: 'DELETE'
                });
                console.log(req.status);
                if (req.ok) {
                    alert('Alumno borrado correctamente.');
                    window.location.reload();
                }
            }
            catch(error){
                console.error('Error al borrar el alumno: ', error);
                alert('Error al borrar los datos.');
            }
        };
        celdaBorrar.appendChild(botonBorrar);
    })
})