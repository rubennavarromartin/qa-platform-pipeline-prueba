/*
* Las dos vistas del listado de presupuestos: la tabla y el kanban.
*
* Las dos pintan los mismos registros. Sólo se pinta la que está
* puesta: pintar el kanban escondido es trabajo tirado, y además
* engañaría al que mire el HTML, que vería tarjetas donde no hay
* nada que ver.
*/

const QuoteUI = (() => {

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    function euros(importe) {

        return `${(Number(importe) || 0).toFixed(2)} €`;

    }

    function fecha(iso) {

        if (!iso) {

            return "";

        }

        const [ano, mes, dia] = String(iso).split("-");

        return `${dia}/${mes}/${ano}`;

    }

    /*
    * Quién manda al pintar: la vista puesta. La pone `app.js` al
    * arrancar, porque es quien monta el conmutador.
    */

    let vistas = null;

    function renderRow(quote) {

        return `

<tr>

    ${CrudPage.celdaDeSeleccion(quote.id)}

    <td>
        <a
            class="ficha"
            href="quotes.html?id=${quote.id}">
            ${escapar(quote.code)}
        </a>
    </td>

    <td>${escapar(quote.company)}</td>

    <td>${fecha(quote.createdAt)}</td>

    <td>${Badge.status(quote.status)}</td>

    <td class="importe">${euros(Quotes.totales(quote).total)}</td>

    <td>

        <div class="action-buttons">

            <button
                class="btn-delete"
                data-id="${quote.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    function bindEvents() {

        document
            .querySelectorAll("#quotesGrid .btn-delete")
            .forEach(button => {

                button.onclick = async () => {

                    const id = Number(button.dataset.id);

                    const quote =
                        Quotes.findById(id);

                    if (!quote) {

                        return;

                    }

                    const dependencias =
                        CrudPage.dependencias(quote);

                    if (dependencias.length) {

                        Toast.error(
                            Relations.aviso(quote.code, dependencias)
                        );

                        return;

                    }

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                `¿Seguro que quieres eliminar el presupuesto "${quote.code}"?`,

                            aceptar: "Eliminar"

                        });

                    if (!confirmado) {

                        return;

                    }

                    Quotes.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    /*
    * Lo que enseña una tarjeta: el código —que lleva a la ficha—, el
    * cliente y el total. Lo que hace falta para decidir si moverla
    * de columna sin abrirla.
    */

    function tarjeta(quote) {

        return `
            <a
                class="ficha kanban-codigo"
                href="quotes.html?id=${quote.id}">
                ${escapar(quote.code)}
            </a>

            <span class="kanban-empresa">${escapar(quote.company)}</span>

            <span class="kanban-importe">${euros(Quotes.totales(quote).total)}</span>`;

    }

    return {

        /*
        * El conmutador de vistas, que se le da al arrancar. Sin él
        * se pinta la tabla, que es lo que había antes de haber dos.
        */

        conVistas(conmutador) {

            vistas = conmutador;

        },

        /*
        * `pagina` es lo que cabe en la tabla; `todos` es todo lo que
        * el buscador ha dejado. El kanban usa `todos`: sus columnas
        * reparten por estado, y una página recortada dejaría
        * columnas vacías que no lo están.
        */

        renderTable(pagina, todos) {

            if (vistas?.actual() === "kanban") {

                Kanban.render({

                    contenedor: "kanban",

                    columnas: Quotes.ESTADOS,

                    registros: todos || pagina,

                    estadoDe: quote => quote.status,

                    tarjeta,

                    /*
                    * Mover una tarjeta cambia el estado y nada más.
                    * Si el repositorio no lo acepta, la tarjeta se
                    * queda donde estaba.
                    */

                    alMover: (id, estado) => {

                        const movido =
                            Quotes.cambiarEstado(id, estado);

                        if (!movido) {

                            return false;

                        }

                        Toast.mostrar(
                            `"${movido.code}" pasa a ${estado}.`
                        );

                        return true;

                    }

                });

                return;

            }

            DataTable.render(
                "#quotesGrid tbody",
                pagina.map(renderRow)
            );

            bindEvents();

        }

    };

})();
