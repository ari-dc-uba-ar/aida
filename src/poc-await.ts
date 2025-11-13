import { watch } from 'fs/promises';

const CARPETA_OBSERVADA = "local-carpeta-observada";

async function servidor(){
    const watcher = watch(CARPETA_OBSERVADA);
    for await (const event of watcher) {
        console.log(event);
    }
}

servidor();
