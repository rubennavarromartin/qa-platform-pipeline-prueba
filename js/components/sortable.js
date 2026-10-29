/*
|--------------------------------------------------------------------------
| Sortable
|--------------------------------------------------------------------------
|
| Ordenar la tabla pulsando sus cabeceras.
|
| Cada cabecera ordenable lleva un `<button>` dentro del `<th>`,
| que es lo que hay que pulsar. Podría ponerse el `onclick` en el
| propio `th`, y así lo hace media web, pero entonces con el
| teclado no se llega: un `th` no entra en el recorrido del
| tabulador ni se activa con Intro.
|
| El sentido se anuncia con `aria-sort` en el `th`, que es lo que
| lee un lector de pantalla, además de la flechita.
|
| No ordena la tabla que hay pintada: le dice al listado por qué
| columna ordenar y éste vuelve a pintar. Ordenar el HTML dejaría
| la paginación mintiendo, porque sólo ordenaría la página que se
| está viendo.
|
*/

const Sortable = (() => {

    const FLECHAS = {

        asc: "▲",

        desc: "▼"

    };

    function crear({ tabla, columnas, onCambio }) {

        const cabecera =
            document.querySelector(`${tabla} thead tr`);

        if (!cabecera) {

            return null;

        }

        let campo = null;

        let sentido = "asc";

        function pintarCabeceras() {

            [...cabecera.children].forEach((th, i) => {

                const columna =
                    columnas[i];

                if (!columna) {

                    return;

                }

                const activa =
                    columna.campo === campo;

                th.setAttribute(
                    "aria-sort",
                    activa
                        ? (sentido === "asc" ? "ascending" : "descending")
                        : "none"
                );

                const boton =
                    th.querySelector("button");

                if (boton) {

                    boton.textContent =
                        activa
                            ? `${columna.titulo} ${FLECHAS[sentido]}`
                            : columna.titulo;

                }

            });

        }

        [...cabecera.children].forEach((th, i) => {

            const columna =
                columnas[i];

            if (!columna?.campo) {

                return;

            }

            th.innerHTML =
                `<button type="button" class="ordenar">${columna.titulo}</button>`;

            th.querySelector("button").addEventListener("click", () => {

                /*
                * La misma columna otra vez le da la vuelta; una
                * distinta empieza de nuevo por ascendente.
                */

                if (campo === columna.campo) {

                    sentido = sentido === "asc" ? "desc" : "asc";

                }
                else {

                    campo = columna.campo;

                    sentido = "asc";

                }

                pintarCabeceras();

                onCambio();

            });

        });

        pintarCabeceras();

        return {

            /*
            * Si hay una columna ordenando. Lo pregunta el
            * listado: con una columna puesta, lo que se ve no es
            * el orden de nadie y las filas no se pueden mover a
            * mano.
            */

            activo() {

                return Boolean(campo);

            },

            /*
            * Los registros ordenados. Sin columna elegida se
            * devuelven como vienen: el orden de la aplicación es
            * una decisión suya, y no hay que pisarla.
            */

            ordenar(registros) {

                if (!campo) {

                    return registros;

                }

                const signo =
                    sentido === "asc" ? 1 : -1;

                return [...registros].sort((a, b) =>

                    signo * String(a[campo] ?? "").localeCompare(
                        String(b[campo] ?? ""),
                        "es",
                        { numeric: true, sensitivity: "base" }
                    )

                );

            }

        };

    }

    return {

        crear

    };

})();
