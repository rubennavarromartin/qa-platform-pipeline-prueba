/*
|--------------------------------------------------------------------------
| Orden
|--------------------------------------------------------------------------
|
| Colocar los registros a mano, arrastrándolos.
|
| Es lo mismo que hacen las tarjetas de aplicaciones de la
| plataforma, y llega aquí por el mismo motivo: el orden en que
| están las cosas es una decisión de quien las usa, no del orden
| en que se dieron de alta.
|
| Se arrastra por el tirador y no por la fila entera. Una fila
| lleva dentro un enlace a la ficha, una casilla de selección y
| botones: si toda ella fuera arrastrable, arrastrar y pulsar se
| pelearían por el mismo clic y no saldría bien ninguna de las
| dos cosas.
|
| Con la lista paginada sólo se ve un trozo, así que al soltar no
| se guarda "el orden" sino ese trozo colocado en los huecos que
| ocupaba: guardando sólo lo que se ve, la primera vez que
| alguien moviera algo en la página dos se perdería el orden de
| la uno.
|
| Y con una columna ordenando, no se puede mover nada: lo que se
| ve entonces no es el orden de nadie, es el de la columna.
| Dejarlo mover guardaría un orden que no se ha decidido.
|
*/

const Orden = (() => {

    function clave(entidad) {

        return `qa-platform-orden-${entidad}`;

    }

    function leer(entidad) {

        try {

            return JSON.parse(
                localStorage.getItem(clave(entidad)) || "[]"
            ).map(String);

        }
        catch {

            return [];

        }

    }

    function guardar(entidad, ids) {

        localStorage.setItem(

            clave(entidad),

            JSON.stringify(ids.map(String))

        );

    }

    /*
    * Lo que se está arrastrando. Va en una variable del módulo
    * porque Firefox no deja leer el `dataTransfer` durante el
    * `dragover`, que es justo donde hace falta.
    */

    let arrastrada = null;

    return {

        /*
        * El tirador por el que se agarra una fila.
        */

        tirador(que = "esta fila") {

            return `<span
                class="tirador"
                title="Arrastra para colocar ${que} donde quieras"
                aria-hidden="true">⠿</span>`;

        },

        /*
        * Y los botones para colocarla sin arrastrar.
        *
        * Arrastrar no puede ser el único camino: la WCAG 2.2 lo pide en su
        * criterio 2.5.7, y una fila que sólo se coloca con el ratón deja
        * fuera a quien no lo usa. Las demás listas del laboratorio siguen
        * sin ellos **a propósito**: son el caso que incumple, y hacen falta
        * los dos para saber si la plataforma los distingue.
        *
        * La primera no tiene "subir" y la última no tiene "bajar": un
        * control que coloca dentro de un orden no está donde no lleva a
        * ninguna parte. Y es además la forma por la que se reconoce desde
        * fuera que aquí hay camino sin arrastrar, sin leerle el nombre a
        * ningún botón.
        *
        * Mueven dentro de lo que se ve, como el arrastre: con la lista
        * paginada no se arrastra una fila a la página siguiente, y esto
        * tampoco.
        */

        botones({ id, primera, ultima, que = "esta fila", sePuede = true }) {

            const boton = (direccion, flecha, texto) => `<button
                type="button"
                class="colocar"
                data-mover="${direccion}"
                data-id="${id}"
                aria-label="${texto}"
                title="${texto} ${que} sin arrastrarla"
                ${sePuede ? "" : "disabled"}>${flecha}</button>`;

            return [
                primera ? "" : boton("arriba", "▲", "Subir"),
                ultima ? "" : boton("abajo", "▼", "Bajar")
            ].join("");

        },

        /*
        * Los registros en el orden guardado.
        *
        * Los que no estén en la lista guardada —recién dados de
        * alta— van al final, en el orden en que vengan. Es lo que
        * espera quien acaba de crear uno: aparece el último.
        */

        aplicar(entidad, registros) {

            const orden =
                leer(entidad);

            if (!orden.length) {

                return registros;

            }

            const puesto =
                id => {

                    const indice =
                        orden.indexOf(String(id));

                    return indice === -1
                        ? Number.MAX_SAFE_INTEGER
                        : indice;

                };

            return [...registros].sort((a, b) => puesto(a.id) - puesto(b.id));

        },

        /*
        * Coloca un trozo del orden sin mover el resto.
        *
        *   entidad    de qué lista
        *   visibles   los identificadores que se ven, ya movidos
        *   todos      todos los de la lista, en el orden que
        *              tienen ahora
        */

        colocar(entidad, visibles, todos) {

            const orden =
                todos.map(String);

            const huecos =
                orden

                    .map((id, indice) => ({ id, indice }))

                    .filter(({ id }) => visibles.map(String).includes(id))

                    .map(({ indice }) => indice);

            huecos.forEach((hueco, i) => {

                orden[hueco] = String(visibles[i]);

            });

            guardar(entidad, orden);

        },

        /*
        * Engancha el arrastre a las filas de una tabla.
        *
        *   contenedor  dónde están las filas
        *   selector    qué es una fila
        *   idDe        (fila) -> su identificador
        *   sePuede     () -> si ahora mismo se deja mover
        *   alSoltar    (ids) -> el orden en que han quedado
        */

        conectar({ contenedor, selector, idDe, sePuede, alSoltar }) {

            if (!contenedor) {

                return;

            }

            contenedor.querySelectorAll(selector).forEach(fila => {

                const tirador =
                    fila.querySelector(".tirador");

                if (!tirador) {

                    return;

                }

                if (sePuede && !sePuede()) {

                    tirador.classList.add("tirador-apagado");

                    tirador.title =
                        "Con una columna ordenando no se pueden mover las filas";

                    return;

                }

                /*
                * El atributo se enciende al agarrar el tirador y
                * se apaga al soltar: así el resto de la fila
                * sigue comportándose como siempre.
                */

                tirador.addEventListener("mousedown", () => {

                    fila.draggable = true;

                });

                tirador.addEventListener("mouseup", () => {

                    fila.draggable = false;

                });

                fila.addEventListener("dragstart", evento => {

                    arrastrada = fila;

                    fila.classList.add("arrastrando");

                    evento.dataTransfer.effectAllowed = "move";

                    /*
                    * Firefox no arranca el arrastre sin datos.
                    */

                    evento.dataTransfer.setData("text/plain", idDe(fila) || "");

                });

                fila.addEventListener("dragend", () => {

                    fila.draggable = false;

                    fila.classList.remove("arrastrando");

                    arrastrada = null;

                    alSoltar(
                        [...contenedor.querySelectorAll(selector)]
                            .map(idDe)
                            .filter(Boolean)
                    );

                });

                /*
                * Mientras se arrastra, la fila va cambiándose de
                * sitio: así se ve dónde va a caer sin tener que
                * imaginárselo.
                */

                fila.addEventListener("dragover", evento => {

                    if (!arrastrada || arrastrada === fila) {

                        return;

                    }

                    evento.preventDefault();

                    evento.dataTransfer.dropEffect = "move";

                    const caja =
                        fila.getBoundingClientRect();

                    const porEncima =
                        evento.clientY < caja.top + caja.height / 2;

                    fila.parentNode.insertBefore(

                        arrastrada,

                        porEncima ? fila : fila.nextSibling

                    );

                });

                fila.addEventListener("drop", evento => {

                    evento.preventDefault();

                });

            });

        },

        olvidar(entidad) {

            localStorage.removeItem(clave(entidad));

        }

    };

})();
