/*
|--------------------------------------------------------------------------
| QuoteForm
|--------------------------------------------------------------------------
|
| El alta y la edición de un presupuesto, en dos pasos como las
| demás, pero con algo que las demás no tienen: un número
| indeterminado de líneas que se añaden y se quitan sin cerrar el
| diálogo, y unos totales que se rehacen a cada tecla.
|
| Lo que esto le pone delante a la plataforma:
|
|   Campos que no existen hasta que alguien pulsa "Añadir línea", y
|   que además se numeran: `#lineDescription3`. Un formulario con un
|   número de campos que depende de lo que el usuario haya hecho.
|
|   Y valores que la aplicación calcula, no que se escriben. El
|   total de una línea no se teclea: sale de multiplicar. Una prueba
|   que rellena campos y comprueba que se han guardado no dice nada
|   de un total; hay que comprobar que la cuenta está bien hecha.
|
| La empresa va por autocompletado y no por desplegable, que es lo
| que hace cualquier aplicación en cuanto tiene doscientos clientes.
|
*/

const QuoteForm = (() => {

    /*
    * Las líneas que se están editando. Viven aquí y no en el HTML
    * porque hay que poder recalcular los totales sin volver a leer
    * la pantalla, y porque una línea a medio escribir sigue siendo
    * una línea.
    */

    let lineas = [];

    let siguienteId = 1;

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

    function opciones(valores, elegido) {

        return valores

            .map(valor => `
                <option ${valor === elegido ? "selected" : ""}>
                    ${escapar(valor)}
                </option>`)

            .join("");

    }

    /*
    * Una fila de la tabla de líneas.
    *
    * Los identificadores llevan el número de la línea porque hay
    * varias a la vez: sin él, todos los campos se llamarían igual y
    * ni una persona ni una prueba sabrían a cuál se refieren.
    */

    function filaDeLinea(linea) {

        return `
<tr data-linea="${linea.id}">

    <td>
        <input
            id="lineDescription${linea.id}"
            class="linea-descripcion"
            data-linea="${linea.id}"
            data-campo="description"
            aria-label="Descripción de la línea ${linea.id}"
            value="${escapar(linea.description)}">
    </td>

    <td>
        <input
            id="lineUnits${linea.id}"
            class="linea-numero"
            data-linea="${linea.id}"
            data-campo="units"
            type="number"
            min="0"
            step="1"
            aria-label="Unidades de la línea ${linea.id}"
            value="${escapar(linea.units)}">
    </td>

    <td>
        <input
            id="linePrice${linea.id}"
            class="linea-numero"
            data-linea="${linea.id}"
            data-campo="price"
            type="number"
            min="0"
            step="0.01"
            aria-label="Importe unitario de la línea ${linea.id}"
            value="${escapar(linea.price)}">
    </td>

    <td>
        <input
            id="lineDiscount${linea.id}"
            class="linea-numero"
            data-linea="${linea.id}"
            data-campo="discount"
            type="number"
            min="0"
            max="100"
            step="1"
            aria-label="Descuento de la línea ${linea.id}"
            value="${escapar(linea.discount)}">
    </td>

    <td
        class="linea-total"
        id="lineTotal${linea.id}">
        ${euros(Quotes.totalDeLinea(linea))}
    </td>

    <td>
        <button
            type="button"
            class="btn-linea-delete"
            data-linea="${linea.id}"
            title="Quitar la línea ${linea.id}">
            🗑
        </button>
    </td>

</tr>`;

    }

    function pintarLineas() {

        const cuerpo =
            document.getElementById("quoteLinesBody");

        if (!cuerpo) {

            return;

        }

        cuerpo.innerHTML =
            lineas.map(filaDeLinea).join("");

        /*
        * Cada línea se escucha entera: cambiar unidades, precio o
        * descuento rehace su total y el del pie. La descripción no
        * cambia ninguna cuenta, pero se guarda igual.
        */

        cuerpo

            .querySelectorAll("input")

            .forEach(campo => {

                campo.addEventListener("input", () => {

                    const linea =
                        lineas.find(l => l.id == campo.dataset.linea);

                    if (!linea) {

                        return;

                    }

                    linea[campo.dataset.campo] =
                        campo.dataset.campo === "description"
                            ? campo.value
                            : campo.value;

                    /*
                    * Se repinta el total de esta línea y el pie, y
                    * no la tabla entera: repintándola, el campo que
                    * se está escribiendo se destruye y se pierde el
                    * foco a cada tecla.
                    */

                    const total =
                        document.getElementById(`lineTotal${linea.id}`);

                    if (total) {

                        total.textContent =
                            euros(Quotes.totalDeLinea(linea));

                    }

                    pintarTotales();

                });

            });

        cuerpo

            .querySelectorAll(".btn-linea-delete")

            .forEach(boton => {

                boton.onclick = () => {

                    lineas =
                        lineas.filter(l => l.id != boton.dataset.linea);

                    pintarLineas();

                    pintarTotales();

                };

            });

        const vacio =
            document.getElementById("quoteLinesVacio");

        if (vacio) {

            vacio.hidden = lineas.length > 0;

        }

    }

    /*
    * El pie. Los cuatro escalones se enseñan, no sólo el total: un
    * total suelto no se puede comprobar.
    */

    function pintarTotales() {

        const descuento =
            Number(document.getElementById("quoteDiscount")?.value) || 0;

        const totales =
            Quotes.totales({ lines: lineas, discount: descuento });

        const poner = (id, valor) => {

            const nodo =
                document.getElementById(id);

            if (nodo) {

                nodo.textContent = euros(valor);

            }

        };

        poner("quoteSuma", totales.suma);

        poner("quoteDescuentoImporte", totales.descuento);

        poner("quoteBase", totales.base);

        poner("quoteIva", totales.iva);

        poner("quoteTotal", totales.total);

    }

    function anadirLinea() {

        lineas = [

            ...lineas,

            {
                id: siguienteId++,
                description: "",
                units: 1,
                price: 0,
                discount: 0
            }

        ];

        pintarLineas();

        pintarTotales();

        document
            .getElementById(`lineDescription${siguienteId - 1}`)
            ?.focus();

    }

    function html(quote = {}) {

        return `

<h2>
    ${quote.id ? "Editar presupuesto" : "Nuevo presupuesto"}
</h2>

<div class="form form-ancho">

    <ol class="pasos">
        <li>1. Cabecera</li>
        <li>2. Líneas y totales</li>
    </ol>

    <fieldset class="paso">

        <legend>Cabecera</legend>

        <label>
            Código *
            <input
                id="quoteCode"
                aria-required="true"
                value="${escapar(
                    quote.code ||
                    (typeof Codigos !== "undefined" ? Codigos.siguiente() : "")
                )}">
        </label>

        <!--
            El código viene propuesto y se puede cambiar. Se dice de dónde
            sale, porque un campo que aparece relleno sin explicación
            parece un dato de otro registro.
        -->

        ${
            quote.id
                ? ""
                : `<p class="ayuda" id="quoteCodeAyuda">
                       Propuesto por Configuración → Presupuestos. Se puede
                       cambiar, pero no puede repetirse.
                   </p>`
        }

        <div class="autocompletar">

            <label for="quoteCompany">
                Empresa
            </label>

            <!--
                Este autocompletado no dice a qué lista apunta, y
                es a propósito.

                El de la Agenda lleva su aria-controls y sigue el
                patrón de ARIA entero. Éste no, que es lo que hace
                la mayoría: se monta el role de combobox porque se
                ha leído que hay que ponerlo, y la mitad que
                relaciona el campo con su lista se queda sin
                poner.

                La pregunta que plantea es si la plataforma sabe
                encontrar la lista cuando nadie le dice dónde
                está. Sin aria-controls no hay por dónde empezar a
                mirar: la lista puede estar al lado del campo, o
                colgando del final del documento, que es lo que
                hacen las librerías de componentes.
            -->

            <input
                id="quoteCompany"
                type="text"
                role="combobox"
                autocomplete="off"
                aria-autocomplete="list"
                aria-expanded="false"
                placeholder="Escribe para buscar..."
                value="${escapar(quote.company || "")}">

            <ul
                id="quoteCompanyLista"
                role="listbox"
                aria-label="Empresas"
                hidden>
            </ul>

            <input
                id="quoteCompanyValor"
                type="hidden"
                value="${escapar(quote.company || "")}">

        </div>

        <label>
            Fecha de creación *
            <input
                id="quoteCreatedAt"
                aria-required="true"
                type="date"
                value="${escapar(quote.createdAt || "")}">
        </label>

        <label>
            Estado

            <select id="quoteStatus">
${opciones(Quotes.ESTADOS, quote.status || Quotes.ESTADOS[0])}
            </select>

        </label>

    </fieldset>

    <fieldset class="paso" hidden>

        <legend>Líneas y totales</legend>

        <div class="toolbar">

            <button
                id="addLineButton"
                class="btn-primary"
                type="button">
                Añadir línea
            </button>

        </div>

        <table id="quoteLines" class="lineas">

            <thead>

                <tr>
                    <th>Descripción</th>
                    <th>Unidades</th>
                    <th>Importe unitario</th>
                    <th>Descuento %</th>
                    <th>Total línea</th>
                    <th></th>
                </tr>

            </thead>

            <tbody id="quoteLinesBody">
            </tbody>

        </table>

        <p
            id="quoteLinesVacio"
            class="aviso"
            role="status">
            Este presupuesto no tiene líneas todavía.
        </p>

        <label>
            Descuento al pie %
            <input
                id="quoteDiscount"
                type="number"
                min="0"
                max="100"
                step="1"
                value="${escapar(quote.discount ?? 0)}">
        </label>

        <dl class="totales">

            <dt>Suma de líneas</dt>
            <dd id="quoteSuma">0.00 €</dd>

            <dt>Descuento al pie</dt>
            <dd id="quoteDescuentoImporte">0.00 €</dd>

            <dt>Base imponible</dt>
            <dd id="quoteBase">0.00 €</dd>

            <dt>IVA (${Quotes.iva()} %)</dt>
            <dd id="quoteIva">0.00 €</dd>

            <dt class="total">Total presupuesto</dt>
            <dd class="total" id="quoteTotal">0.00 €</dd>

        </dl>

    </fieldset>

    <div class="modal-buttons">

        <button
            id="cancelButton"
            class="btn-cancel"
            type="button">
            Cancelar
        </button>

        <button
            id="backButton"
            class="btn-secondary"
            type="button"
            hidden>
            Atrás
        </button>

        <button
            id="nextButton"
            class="btn-primary"
            type="button">
            Siguiente
        </button>

        <button
            id="saveButton"
            type="button"
            hidden>
            Guardar
        </button>

    </div>

</div>

`;

    }

    function save(quote = {}) {

        const nuevo = {

            id: quote.id,

            code: document
                .getElementById("quoteCode")
                .value
                .trim(),

            /*
            * La empresa se lee del campo oculto y no de la caja de
            * texto: en un autocompletado lo escrito a mano no es una
            * elección, y guardarlo dejaría un cliente que no existe.
            */

            company: document
                .getElementById("quoteCompanyValor")
                .value
                .trim(),

            createdAt: document
                .getElementById("quoteCreatedAt")
                .value,

            status: document
                .getElementById("quoteStatus")
                .value,

            discount:
                Number(document.getElementById("quoteDiscount").value) || 0,

            lines:
                lineas.map(linea => ({

                    id: linea.id,

                    description: String(linea.description || "").trim(),

                    units: Number(linea.units) || 0,

                    price: Number(linea.price) || 0,

                    discount: Number(linea.discount) || 0

                }))

        };

        if (!nuevo.code) {

            Toast.error("El código del presupuesto es obligatorio.");

            return;

        }

        /*
        * El código no se puede repetir. Y en lugar de decir sólo que no,
        * se deja puesto el hueco más cercano hacia arriba: quien está
        * creando un presupuesto no tiene por qué salir a mirar cuáles
        * están cogidos.
        */

        if (
            typeof Codigos !== "undefined" &&
            Codigos.estaCogido(nuevo.code, quote.id)
        ) {

            const hueco =
                Codigos.elHuecoDe(nuevo.code);

            const campo =
                document.getElementById("quoteCode");

            campo.value = hueco;

            campo.focus();

            campo.select();

            Toast.error(
                `El código ${nuevo.code} ya existe. Se propone ${hueco}.`
            );

            return;

        }

        if (!nuevo.company) {

            Toast.error("Elige una empresa de la lista.");

            return;

        }

        if (!nuevo.createdAt) {

            Toast.error("La fecha de creación es obligatoria.");

            return;

        }

        /*
        * Un presupuesto sin líneas suma cero, y un presupuesto de
        * cero euros no es un presupuesto. Se dice antes de
        * guardarlo, no después.
        */

        if (!nuevo.lines.length) {

            Toast.error("Un presupuesto necesita al menos una línea.");

            return;

        }

        const sinDescripcion =
            nuevo.lines.filter(linea => !linea.description);

        if (sinDescripcion.length) {

            Toast.error(
                sinDescripcion.length === 1
                    ? "Hay una línea sin descripción."
                    : `Hay ${sinDescripcion.length} líneas sin descripción.`
            );

            return;

        }

        /*
        * Y el descuento al pie, entre 0 y 100, que es lo que declara su
        * campo (`min` y `max`). Se guardaba un −1 % y un 101 %: el botón de
        * guardar no es de un formulario y el navegador no valida nada. Lo
        * encontró la prueba de romper las reglas de un campo (`REGLA`), el 20
        * de octubre de 2026.
        */

        if (nuevo.discount < 0 || nuevo.discount > 100) {

            Toast.error("El descuento al pie va de 0 a 100.");

            return;

        }

        /*
        * El repositorio comprueba la unicidad otra vez y se niega con un
        * error. Aquí no debería llegar nunca —arriba ya se ha mirado— pero
        * si llega, lo que no puede pasar es que el diálogo se cierre como
        * si se hubiera guardado.
        */

        try {

            if (quote.id) {

                Quotes.update(nuevo);

            }
            else {

                Quotes.create(nuevo);

            }

        }
        catch (error) {

            Toast.error(error.message);

            return;

        }

        CrudPage.pintar();

        Modal.close();

    }

    return {

        open(quote = {}) {

            /*
            * Las líneas se copian, no se usan las del registro. Sin
            * copiarlas, cancelar el diálogo dejaría los cambios
            * hechos: se estarían tocando los objetos guardados.
            */

            lineas =
                (quote.lines || []).map(linea => ({ ...linea }));

            siguienteId =
                lineas.reduce(
                    (mayor, linea) => Math.max(mayor, Number(linea.id) || 0),
                    0
                ) + 1;

            Modal.open(
                html(quote)
            );

            Wizard.create();

            Autocomplete.crear({

                campo: "quoteCompany",

                valores: () => Companies.nombres()

            });

            pintarLineas();

            pintarTotales();

            document
                .getElementById("addLineButton")
                .onclick = anadirLinea;

            document
                .getElementById("quoteDiscount")
                .addEventListener("input", pintarTotales);

            document
                .getElementById("cancelButton")
                .onclick = Modal.close;

            document
                .getElementById("saveButton")
                .onclick = () => save(quote);

        }

    };

})();
