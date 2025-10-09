
export async function leerYParsearJson(alumnosJson:any[]){
    if (!Array.isArray(alumnosJson) || alumnosJson.length === 0) {
        return { dataLines: [], columns: [] };
    }

    const columns: string[] = Object.keys(alumnosJson[0]);

    const dataLines: string[][] = alumnosJson.map(alumno => {

        return columns.map(colName => {
            const value = alumno[colName];

            if (value === null || value === undefined) {
                return '';
            }
            return String(value).trim();
        });
    });

    console.log("JSON PARSEADO a formato tabular. Columnas:", columns);
    console.log("JSON PARSEADO a formato tabular. Filas:", dataLines);

    return { dataLines, columns };
}