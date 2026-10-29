/*
|--------------------------------------------------------------------------
| Kanban
|--------------------------------------------------------------------------
|
| Los registros repartidos en columnas por su estado, y tarjetas
| que se arrastran de una columna a otra.
|
| Es la otra mitad de lo que el laboratorio no tenía. Arrastrar una
| tarjeta **cambia un dato del registro** sin abrir ningún
| formulario: no hay diálogo, ni botón de guardar, ni fila. Todo lo
| que la plataforma sabe probar hasta ahora pasa por un formulario
| o por un botón de una fila.
|
| Arrastrar es de ratón, y con el teclado no se llega. Así que cada
| tarjeta lleva además dos botones que la mueven a la columna de al
| lado. No es un adorno de accesibilidad: es el único camino que
| tiene quien no usa ratón, y —de paso— el único que una prueba
| automática puede recorrer sin simular una arrastrada. Las dos
| maneras acaban en el mismo sitio.
|
| Los estados extremos no ofrecen el botón que no lleva a ninguna
| parte: en la primera columna no hay "anterior" y en la última no
| hay "siguiente". Un botón desactivado que no se puede explicar es
| peor que no ponerlo.
|
*/

const Kanban = (() => {

    /*
    * Lo que se está arrastrando. Va aquí y no sólo en el
    * `dataTransfer` porque Firefox no deja leerlo durante el
    * `dragover`, que es justo donde hace falta para saber si la
    * columna acepta lo que viene.
    */

    let arrastrando = null;

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    /*
    * config:
    *
    *   contenedor   id de donde se pinta
    *   columnas     los estados, en orden
    *   registros    lo que hay que repartir
    *   estadoDe     (registro) -> en qué columna va
    *   tarjeta      (registro) -> el HTML de dentro de su tarjeta
    *   alMover      (id, estado) -> cambiar el estado. Devuelve si
    *                se ha podido.
    */

    function render(config) {

        const contenedor =
            document.getElementById(config.contenedor);

        if (!contenedor) {

            return;

        }

        const { columnas, registros, estadoDe, tarjeta } = config;

        contenedor.innerHTML =

            columnas

                .map((columna, indice) => {

                    const suyos =
                        registros.filter(r => estadoDe(r) === columna);

                    return `
<section
    class="kanban-columna"
    data-estado="${escapar(columna)}"
    aria-labelledby="kanbanTitulo${indice}">

    <h3 id="kanbanTitulo${indice}">
        ${escapar(columna)}
        <span class="kanban-cuenta">${suyos.length}</span>
    </h3>

    <ul
        class="kanban-lista"
        data-estado="${escapar(columna)}"
        aria-label="Presupuestos en estado ${escapar(columna)}">
${suyos.map(registro => tarjetaHtml(registro, columna, columnas, tarjeta)).join("")}
    </ul>

    <p class="kanban-vacia" ${suyos.length ? "hidden" : ""}>
        Nada en ${escapar(columna)}.
    </p>

</section>`;

                })

                .join("");

        enganchar(contenedor, config);

    }

    function tarjetaHtml(registro, columna, columnas, tarjeta) {

        const indice =
            columnas.indexOf(columna);

        const anterior =
            indice > 0 ? columnas[indice - 1] : null;

        const siguiente =
            indice < columnas.length - 1 ? columnas[indice + 1] : null;

        return `
        <li
            class="kanban-tarjeta"
            draggable="true"
            data-id="${registro.id}"
            data-estado="${escapar(columna)}">

            ${tarjeta(registro)}

            <div class="kanban-mover">
${anterior ? `
                <button
                    type="button"
                    class="kanban-atras"
                    data-id="${registro.id}"
                    data-destino="${escapar(anterior)}"
                    title="Mover a ${escapar(anterior)}">
                    ◀ ${escapar(anterior)}
                </button>` : ""}
${siguiente ? `
                <button
                    type="button"
                    class="kanban-adelante"
                    data-id="${registro.id}"
                    data-destino="${escapar(siguiente)}"
                    title="Mover a ${escapar(siguiente)}">
                    ${escapar(siguiente)} ▶
                </button>` : ""}
            </div>

        </li>`;

    }

    function enganchar(contenedor, config) {

        /*
        * Mover con los botones.
        */

        contenedor

            .querySelectorAll(".kanban-atras,.kanban-adelante")

            .forEach(boton => {

                boton.onclick = () => {

                    mover(
                        boton.dataset.id,
                        boton.dataset.destino,
                        config
                    );

                };

            });

        /*
        * Y moverlas arrastrando.
        */

        contenedor

            .querySelectorAll(".kanban-tarjeta")

            .forEach(nodo => {

                nodo.addEventListener("dragstart", evento => {

                    arrastrando = {

                        id: nodo.dataset.id,

                        desde: nodo.dataset.estado

                    };

                    nodo.classList.add("arrastrando");

                    evento.dataTransfer.setData("text/plain", nodo.dataset.id);

                    evento.dataTransfer.effectAllowed = "move";

                });

                nodo.addEventListener("dragend", () => {

                    nodo.classList.remove("arrastrando");

                    arrastrando = null;

                });

            });

        contenedor

            .querySelectorAll(".kanban-lista")

            .forEach(lista => {

                lista.addEventListener("dragover", evento => {

                    /*
                    * Sin esto el navegador no deja soltar: el
                    * comportamiento por defecto de `dragover` es
                    * rechazar.
                    */

                    if (!arrastrando || arrastrando.desde === lista.dataset.estado) {

                        return;

                    }

                    evento.preventDefault();

                    lista.classList.add("kanban-recibe");

                });

                lista.addEventListener("dragleave", () => {

                    lista.classList.remove("kanban-recibe");

                });

                lista.addEventListener("drop", evento => {

                    evento.preventDefault();

                    lista.classList.remove("kanban-recibe");

                    const id =
                        arrastrando?.id
                        || evento.dataTransfer.getData("text/plain");

                    if (!id) {

                        return;

                    }

                    mover(id, lista.dataset.estado, config);

                });

            });

    }

    function mover(id, destino, config) {

        const movido =
            config.alMover(id, destino);

        if (!movido) {

            return;

        }

        render(config);

    }

    return {

        render

    };

})();
