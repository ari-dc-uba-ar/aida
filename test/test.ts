import * as assert from "assert";

import { deTexto, aTexto, aISO, deISO, mismaFecha, Fecha } from '../src/fechas.ts'

var textoISO = '2025-09-13'
var textoFecha = '13/09/2025'
var textoFechaMasHumano = '13/9/2025'

describe("fechas", function(){
    it("interpreta y muestra una fecha en texto", function(){
        var fecha = deTexto(textoFecha)
        assert.equal(aTexto(fecha), textoFecha);
    })
    it("interpreta y muestra una fecha en ISO", function(){
        var fecha = deISO(textoISO)
        assert.equal(aISO(fecha), textoISO);
    })
    it("en texto común o en ISO son la misma fecha", function(){
        var fecha = deISO(textoISO)
        var misma = deTexto(textoFecha)
        assert.ok(mismaFecha(fecha, misma), "misma fecha");
    })
    it("no exige ceros a la izquierda", function(){
        var fecha = deTexto(textoFechaMasHumano)
        assert.equal(aTexto(fecha), textoFecha);
    })
})

describe("tipos fechas", function(){
    var date = new Date(textoISO);
    it("no reconoce un Date como fecha", function(){
        // @ts-expect-error no se puede asignar un date común en fecha
        var fecha:Fecha = date;
        // @ts-expect-error no se puede pasar un date a una función que recibe fecha
        assert.equal(aTexto(date), aTexto(fecha))
    })
})
