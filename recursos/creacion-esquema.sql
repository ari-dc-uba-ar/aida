set role to aida_owner;
drop schema if exists aida cascade;
create schema aida;
grant usage on schema aida to aida_admin;

create table aida.alumnos (
    lu text primary key,
    apellido text not null,
    nombres text not null,
    titulo text,
    titulo_en_tramite date,
    egreso date
);

grant select, insert, update, delete on aida.alumnos to aida_admin;