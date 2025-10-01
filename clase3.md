# Clase 3 – Tres modos del CLI  

## Objetivo de la clase: 


Enriquecer el CLI para soportar tres modos de uso: carga de datos desde planilla (ya implementado), emisión de constancias por fecha y emisión de constancia por LU. Cada modo refleja una necesidad concreta: la carga masiva en secretaría, los reportes díarios y la atención al alumno en ventanilla.  

## Necesidades del Producto 

Nuestro jefe esta muy contento con este MVP de la herramienta y busca darle más utilidad.

En **secretaría** se trabaja con las planillas que llegan de forma mensual. El interés es poder cargar los nuevos valores en la base, sin borrar los valores anteriores como se estaba haciendo hasta ahora. De ahí surge el **modo carga**, que toma el CSV y actualiza la tabla de alumnos.  

En la **dirección**, en cambio, suele pedirse generarse todas las constancias del fecha. Para eso sirve el **modo fecha**, que recibe un día y genera todos los certificados correspondientes a esa fecha, dejándolos listos en la carpeta de salida.  

Finalmente, en **ventanilla**, un alumno puede pedir su constancia puntual. Para eso está el **modo LU**, que recibe la libreta universitaria y genera el certificado correspondiente, siempre que los datos estén completos.  
 

## Reglas generales y parámetros

- **Modo carga**  
  - Parámetros: `--archivo <ruta_al_archivo_csv>`  
  - Resultado: se refresca la tabla de alumnos con el contenido del CSV.  

- **Modo fecha**  
  - Parámetros: `--fecha <YYYY-MM-DD>`  
  - Resultado: Genera los certificados con la fecha de tramite pedida

- **Modo LU**  
  - Parámetros: `--lu <identificador>`  
  - Resultado: genera un certificado para el alumno con la LU indicada o informa si no es posible.  

En todos los casos, si falta un parámetro obligatorio o su formato es inválido, el programa debe mostrar un mensaje de error con ejemplos de uso. Si no se indica ningún modo, se puede mostrar la ayuda general o mantener el comportamiento actual como alias del modo carga.  

**Si no se especifica ningún modo, el programa debe fallar e informar sobre que es necesario el uso de un modo.**
