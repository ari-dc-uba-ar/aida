import * as assert from "assert";

import { deCualquierTexto, deTexto, aTexto, aISO, deISO, esFecha, mismaFecha } from '../src/fechas.js'

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
    it("auto detecta texto", function(){
        var fecha = deCualquierTexto(textoFecha)
        assert.equal(aTexto(fecha), textoFecha);
    })
    it("auto detecta ISO", function(){
        var fecha = deCualquierTexto(textoISO)
        assert.equal(aTexto(fecha), textoFecha);
    })
})

describe("tipos fechas", function(){
    it("discrimina un entero no es fecha", function(){
        var entero = 7;
        assert.equal(esFecha(entero), false)
    })
    it("discrimina un boolean no es fecha", function(){
        var logico = false;
        assert.equal(esFecha(logico), false)
    })
    it("discrimina un nulo no es fecha", function(){
        var nulo = null;
        assert.equal(esFecha(nulo), false)
    })
    it("discrimina un string no es fecha", function(){
        var texto = 'texto';
        assert.equal(esFecha(texto), false)
    })
    it("discrimina una fecha sí es fecha", function(){
        var fecha = deTexto(textoFecha);
        assert.equal(esFecha(fecha), true)
    })
})
