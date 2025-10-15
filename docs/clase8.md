# Clase 8. Cierre de Carrera: Materias, Cursadas y Generación Automática de Título

## Necesidad del producto

La institución detectó la necesidad de **agilizar el proceso de solicitud de títulos en trámite**.  
Actualmente, los alumnos deben iniciar manualmente ese pedido una vez que completan todas las materias y una persona tiene que verificar la petición de cada alumno de forma manual, lo cual genera demoras y trabajo administrativo adicional.  

Se propone incorporar al sistema AIDA una funcionalidad que permita **iniciar automáticamente el título en trámite** cuando un alumno apruebe todas las materias requeridas por su carrera.  
Esto busca **mejorar la experiencia del estudiante** y **optimizar los procesos internos**, reduciendo la intervención manual.

Nota: Para los grupos que tienen un **Proyecto Propio**: avancen con el desarrollo de su aplicación creando las nuevas entidades de su modelo y empezando a construir las funcionalidades. 

## Objetivo de la clase

Extender el modelo del sistema AIDA incorporando la relaciones necesarias y definir una lógica de negocio automática:  
cuando un alumno apruebe todas las materias, el sistema debe registrar que **su título está en trámite**.

El foco no está tan solo en diseñar nuevas tablas, sino en **pensar cómo resolver esa automatización** — ya sea existen multiples formas de hacerlo. Implementen la que piensen sea la mejor

## Requisitos técnicos

Cada grupo deberá:
- Incorporar las entidades necesarias (por ejemplo, `materias` y `cursadas`) y definir sus relaciones con `alumnos`.  
- Decidir qué **campos** incluir en cada tabla, justificando su diseño en base a los temas vistos en la práctica (normalización, claves primarias/foráneas, integridad referencial, etc.).  
- Implementar la **lógica de negocio automática** para la generación del título en trámite.  


## Integración con el frontend

Las nuevas entidades creadas deben poder **administrarse desde el menú del frontend**, del mismo modo que ya se puede con la tabla de alumnos. De igual forma que con los alumnos, solamente un usuario logeado puede ver esa información. 

# Para los grupos que usan AIDA como Trabajo Práctico Final

Los grupos que están continuando con AIDA como **Trabajo Práctico Integrador** deben ir definiendo **qué aspecto del sistema planean extender**.  
Durante las próximas clases deberán **consultar con la cátedra** para validar la idea y asegurarse de que tenga el nivel de complejidad esperado.
