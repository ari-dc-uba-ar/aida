# Instalar postgreSQL en modo desarrollo en Linux

## configurar

Buscar el archivo `postgres.conf` 
(eso se puede hacer así `sudo -u postgres psql -c "SHOW config_file;"`)
y para aceptar conexiones entrantes.

1. Quitar el `#` (símbolo de comentario) de la linea
`#listen_addresses = 'localhost'`.
Esto va a permitir conectarse por IP, 
si no solo te podés conectar desde la línea de comandos.
2. Reiniciar el postgres para que tome la configuración. 
`sudo systemctl restart postgres`

## correr comandos sin pgAdmin

Para crear la base de datos:
`sudo -u postgres psql < recursos/creacion-db.sql`. 
Esto creó la base de datos y los usuarios. 

Para crear las tablas:
`sudo -u postgres psql aida_db < recursos/creacion-esquema.sql`.
Fijense que la diferencia es que ahí especificamos la base de datos.
El usuario que ejecuta es postgres pero al ejecutar el comando
`set role to aida_owner` el usuario se transforma en `aida_owner`.

Obviamente eso se puede hacer porque te conectaste con un superusuario. 

Para probar que todo quedó bien ejecutar:

`psql --host 127.0.0.1 --user aida_admin --password aida_db`

Pide la password y sie es correcta muestra un prompt:
`>`

Se sale tipieando `\q`

## para usar pgAdmin

Hay que agregar una conexión con los siguientes parámetros:

En **Host** poner `127.0.0.1`
En **mantenaince database** poner `aida_db`
En **User** `aida_admin`
y la password
