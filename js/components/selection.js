/*
|--------------------------------------------------------------------------
| Selection
|--------------------------------------------------------------------------
|
| Selección múltiple: una casilla por fila, otra en la cabecera
| para marcarlas todas, y una acción que se aplica a lo marcado.
|
| La casilla de la cabecera tiene tres estados y no dos: marcada,
| sin marcar, y a medias cuando hay algunas. Ese tercero es el
| que casi nadie pinta y el que evita que parezca que no hay nada
| seleccionado.
|
| Lo seleccionado se guarda por identificador y no por fila,
| porque las filas cambian: al pasar de página, al ordenar o al
| buscar, la fila tres ya no es el mismo registro. Con la lista
| de identificadores, lo marcado sobrevive a todo eso.
|
*/

const Selection = (() => {

    function crear({ tabla, onCambio, onBorrar }) {

        const marcados =
            new Set();

        const contador =
            document.getElementById("seleccionEstado");

        const boton =
            document.getElementById("borrarSeleccionButton");

        function pintarBarra() {

            if (contador) {

                contador.textContent =
                    marcados.size === 0
                        ? "Nada seleccionado"
                        : `${marcados.size} ${marcados.size === 1 ? "seleccionado" : "seleccionados"}`;

            }

            if (boton) {

                boton.disabled = marcados.size === 0;

            }

        }

        /*
        * La casilla de la cabecera, según lo que haya marcado de
        * lo que se está viendo.
        */

        function pintarCabecera(visibles) {

            const cabecera =
                document.getElementById("seleccionTodo");

            if (!cabecera) {

                return;

            }

            const marcadosVisibles =
                visibles.filter(id => marcados.has(String(id))).length;

            cabecera.checked =
                visibles.length > 0 &&
                marcadosVisibles === visibles.length;

            cabecera.indeterminate =
                marcadosVisibles > 0 &&
                marcadosVisibles < visibles.length;

        }

        return {

            /*
            * La celda de la casilla de una fila, que pinta el
            * listado junto a las demás.
            */

            /*
            * La primera celda de la fila: el tirador para
            * colocarla y la casilla para seleccionarla.
            *
            * El tirador va aquí y no en una columna propia porque
            * las seis pantallas pintan sus filas por su cuenta y
            * esta celda es lo único que comparten: una columna
            * más habría que añadirla en seis sitios, y en las seis
            * cabeceras.
            */

            celda(id, colocar = "") {

                return `<td class="columna-seleccion">
                    ${typeof Orden !== "undefined" ? Orden.tirador("esta fila") : ""}
                    ${colocar}
                    <input
                    type="checkbox"
                    class="seleccion"
                    data-id="${id}"
                    aria-label="Seleccionar"
                    ${marcados.has(String(id)) ? "checked" : ""}></td>`;

            },

            /*
            * Después de pintar la tabla: se enganchan las
            * casillas de las filas que hay ahora.
            */

            enganchar(visibles) {

                document

                    .querySelectorAll(`${tabla} .seleccion`)

                    .forEach(casilla => {

                        casilla.onchange = () => {

                            const id =
                                casilla.dataset.id;

                            if (casilla.checked) {

                                marcados.add(id);

                            }
                            else {

                                marcados.delete(id);

                            }

                            pintarCabecera(visibles);

                            pintarBarra();

                        };

                    });

                const cabecera =
                    document.getElementById("seleccionTodo");

                if (cabecera) {

                    cabecera.onchange = () => {

                        for (const id of visibles) {

                            if (cabecera.checked) {

                                marcados.add(String(id));

                            }
                            else {

                                marcados.delete(String(id));

                            }

                        }

                        onCambio();

                    };

                }

                pintarCabecera(visibles);

                pintarBarra();

            },

            seleccionados() {

                return [...marcados];

            },

            olvidar() {

                marcados.clear();

            },

            create() {

                if (boton) {

                    boton.addEventListener("click", () => {

                        onBorrar([...marcados]);

                    });

                }

                pintarBarra();

            }

        };

    }

    return {

        crear

    };

})();
