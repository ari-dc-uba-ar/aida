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
    var req = await fetch('http://localhost:3000/api/v0/alumno/');
    var data = await req.json();
    console.log(data);
    document.body.innerHTML = ``;
    var table = dom('table', {id:'table-alumnos'}, []) as HTMLTableElement;
    var main = dom('div', {className:'main'}, [
        dom('h1', {}, [text('Alumnos')]),
        table
    ]);
    var row = table.insertRow();
    cel(row, 'LU');
    cel(row, 'Apellido');
    cel(row, 'Nombres');
    cel(row, 'Título');
    cel(row, 'Título en trámite');
    cel(row, 'Egreso');
    data.forEach((alumno:Record<string, string>) => {
        var row = table.insertRow();
        cel(row, alumno.lu);
        cel(row, alumno.apellido);
        cel(row, alumno.nombres);
        cel(row, alumno.titulo);
        cel(row, alumno.titulo_en_tramite);
        cel(row, alumno.egreso);
    })
    document.body.appendChild(main);
})