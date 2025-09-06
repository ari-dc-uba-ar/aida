// Prueba de Concepto de parámetros por línea de comando

// el objeto global process 

console.log('parámetros de la línea de comandos', process.argv, process.argv.length);

const comando = process.argv[process.argv.length-2];
const parametro = process.argv[process.argv.length-1];

console.log('parametros a considerar', comando, parametro)