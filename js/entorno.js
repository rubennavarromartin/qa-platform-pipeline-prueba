/*
|--------------------------------------------------------------------------
| Entorno
|--------------------------------------------------------------------------
|
| El laboratorio se sirve en tres carpetas, una por entorno —`crm` es `pro`,
| `crm_dev` y `crm_pre` los otros dos—, y cada una tiene que tener sus datos
| como cada entorno de verdad tiene su base. Sin esto no la tendrían: el
| laboratorio guarda en `localStorage` y `sessionStorage`, que son de cada
| origen y no de cada carpeta, y las tres viven en el mismo. Lo que una prueba
| creara en `dev` aparecería en `pro`, y una prueba en verde en un entorno y en
| rojo en otro —que es lo que el piloto viene a enseñar— no se podría montar.
|
| Se resuelve aquí, en un sitio, poniendo delante de cada clave la carpeta. Se
| pensó en cambiar la clave de cada repositorio, y son dieciséis `STORAGE_KEY`
| más los `clave()` de comentarios, documentos, vistas, orden y perfil: el
| siguiente que se añadiera sin prefijo volvería a mezclar los entornos sin que
| nada lo dijera.
|
| `crm` se queda sin prefijo a propósito. Es el laboratorio de siempre, el que
| sirve de guardián de toda la plataforma, y sus claves no se mueven: lo que se
| midió en él antes de esto sigue valiendo.
|
| Va en la cabecera, antes que `tema.js`, porque el tema ya lee de
| `localStorage` al cargar. Lo que la plataforma siembra con `addInitScript`
| —la sesión guardada— corre antes que esto y escribe las claves tal cual las
| guardó Playwright, que ya son las de con prefijo: la ida y la vuelta cuadran.
|
*/

(() => {

    const carpeta =
        location.pathname.match(/\/laboratory\/([^/]+)\//)?.[1];

    if (!carpeta || carpeta === "crm") {

        return;

    }

    const prefijo =
        `${carpeta}:`;

    const { getItem, setItem, removeItem } =
        Storage.prototype;

    Storage.prototype.getItem = function (clave) {

        return getItem.call(this, prefijo + clave);

    };

    Storage.prototype.setItem = function (clave, valor) {

        return setItem.call(this, prefijo + clave, valor);

    };

    Storage.prototype.removeItem = function (clave) {

        return removeItem.call(this, prefijo + clave);

    };

})();
