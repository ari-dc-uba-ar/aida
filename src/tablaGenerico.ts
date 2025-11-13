import { DiccionariosTablas } from "./diccionariosGetTablas";

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

window.addEventListener('load', async function() {
    const tabla = window.location.pathname.split('/')[2];
    console.log(tabla);
    const datosTabla = DiccionariosTablas.find(t => t.tabla === tabla);
    document.body.innerHTML = ``;
    var table = dom('table', {id:'tabla'}, []) as HTMLTableElement;
    var main = dom('div', {className:'main'}, [
        dom('h1', {}, [text(datosTabla!.text)]),
        table
    ]);
    document.body.appendChild(main);


    var botonCrear = dom('button', { class: 'boton-crear', type: 'button' }, [text(datosTabla!.crear)]) as HTMLButtonElement;
    botonCrear.onclick = () => {
        if(datosTabla != undefined){
            const urlCreacion = datosTabla.urlCreacion;
            console.log(`Abriendo ventana para crear un/una ${tabla}`);
            window.location.href = urlCreacion;
        }
    };

    var botonMenu = dom('button', { class: 'boton-menu', type: 'button' }, [text('<- Menu')]) as HTMLButtonElement;
    botonMenu.onclick = () => {
        window.location.href = 'menu'
    }

    main.appendChild(document.createElement('br'));
    main.appendChild(botonCrear);
    main.appendChild(botonMenu)
    var row = table.insertRow();
    for (const campo of datosTabla!.campos){
        cel(row, campo);
    }
    var req = await fetch('http://localhost:3000/api/v0/' + (datosTabla!.tabla === 'alumno' ? 'alumnos' : datosTabla!.tabla) + '/');
    var data = await req.json();
    data.forEach((registro:Record<string, string>) => {
        var row = table.insertRow();
        for (const elemento of Object.entries(registro)){
            cel(row, elemento[1]);
        }


        var botonEditar = dom('button', { class: 'boton-editar' }, [text('Editar')]) as HTMLButtonElement;

        botonEditar.onclick = () => {
            const pk = datosTabla!.pk;
            let id = '';
            let i = 0;
            pk.forEach(key => {
                id += registro[key];
                if(i < pk.length - 1){
                    id += '_';
                }
                i++;
            });
            const idCodificado = encodeURIComponent(id);
            const urlEdicion = datosTabla!.urlEdicion + idCodificado;
            console.log(`Abriendo ventana para editar al ID: ${id}`);
            window.location.href = urlEdicion;
        };
        if(tabla != 'materiasporcarrera' && tabla != 'alumnosporcarrera'){
            var celdaEditar = row.insertCell();
            celdaEditar.appendChild(botonEditar);
        }
        var celdaBorrar = row.insertCell();
        var botonBorrar = dom('button', { class: 'boton-borrar', type: 'button' }, [text('Borrar')]) as HTMLButtonElement;

        botonBorrar.onclick = async () => {
            const pk = datosTabla!.pk;
            let id = '';
            let i = 0;
            pk.forEach(key => {
                id += registro[key];
                if(i < pk.length - 1){
                    id += '_';
                }
                i++;
            });

            console.log(`Borrando al ${datosTabla!.tabla}: ${id}`);
            try{
                var req = await fetch('http://localhost:3000/api/v0/' + (datosTabla!.tabla === 'alumno' ? 'alumnos' : datosTabla!.tabla) + '/' + encodeURIComponent(id), {
                    method: 'DELETE'
                });
                console.log(req.status);
                if (req.ok) {
                    alert('Datos borrados correctamente.');
                    window.location.reload();
                }
            }
            catch(error){
                console.error('Error al borrar los datos: ', error);
                alert('Error al borrar los datos.');
            }
        };
        celdaBorrar.appendChild(botonBorrar);
    })
})