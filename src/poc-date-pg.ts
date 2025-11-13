import { Client } from 'pg';
var client = new Client();
client.connect();
var result = await client.query("select '2024-12-31'::date as fecha") as {rows: {fecha: Date}[]};
var fecha = result.rows[0]!.fecha
console.log(fecha.toISOString(), fecha.toLocaleString());

client.end();
