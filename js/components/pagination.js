/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
|
| Paginación de un listado: cuántos por página y por cuál se va.
|
| Es el componente que más incomoda a quien mire la pantalla de
| fuera, y por eso está aquí. Una rejilla paginada ya no enseña
| todos los registros: contar sus filas deja de decir cuántos hay.
| Una prueba que crea un registro y espera "una fila más" acierta
| de milagro —porque cabía en la página— y falla el día que no
| quepa.
|
| El selector ofrece 5, 10, 25, 50 y todos. Diez por defecto: con
| los pocos registros que trae el laboratorio se ve la tabla
| entera, y bajando a cinco se ve paginar de verdad.
|
| Los cuatro botones son los de siempre —primero, atrás, adelante
| y último— y se apagan cuando no llevan a ninguna parte, que es
| más honesto que dejarlos pulsables sin efecto.
|
| Y se puede pedir **sin selector de tamaño**, con un número por página
| entre los botones: el paginador de PrimeNG, que es el de SABESP. Allí
| la plataforma no veía que la tabla paginaba —1.218 unidades de 25 en
| 25—, porque buscaba los botones de pasar alrededor del selector, y sin
| selector no hay alrededor. Medido el 14 de octubre de 2026. Sin
| selector tampoco hay "todos", que es lo que de verdad complica las
| cosas: contar filas ya no dice cuántos registros hay, y nada en la
| pantalla deja pedirlo.
|
*/

const Pagination = (() => {

    const TAMANOS = [5, 10, 25, 50];

    const TODOS = "todos";

    const POR_DEFECTO = 10;

    function crear({ id, onCambio, sinTamano = false, tamano = POR_DEFECTO }) {

        const contenedor =
            document.getElementById(id);

        if (!contenedor) {

            return null;

        }

        /*
        | Dónde estaba, para poder volver
        |
        | La página y el tamaño se recuerdan mientras dure la pestaña, con
        | una clave por listado. Lo pidió la plataforma: su prueba de volver
        | con el botón del navegador encontró que al salir de una ficha se
        | volvía siempre a la primera página.
        |
        | Y era incoherente con lo que esta aplicación ya hacía — se acuerda
        | de si estabas en tabla o en kanban, pero no de en qué página—: quien
        | revisaba el registro cuarenta entraba en su ficha, volvía, y
        | aparecía en el uno.
        |
        | `sessionStorage` y no `localStorage`: es dónde estabas ahora, no una
        | preferencia. Mañana, o en otra pestaña, se empieza por el principio.
        */

        const DONDE_ESTABA =
            `crm.paginacion.${id}.${location.pathname}`;

        const loQueHabia = (() => {

            try {

                return JSON.parse(sessionStorage.getItem(DONDE_ESTABA)) || {};

            }
            catch (error) {

                /*
                * Si lo guardado no se puede leer, se empieza de cero. Una
                * pantalla que no se pinta porque su sitio guardado está roto
                * es peor que una pantalla que se pinta por el principio.
                */

                return {};

            }

        })();

        let porPagina =
            sinTamano
                ? tamano
                : (loQueHabia.porPagina || POR_DEFECTO);

        let pagina =
            loQueHabia.pagina || 1;

        let total = 0;

        function apuntarDondeEstoy() {

            try {

                sessionStorage.setItem(
                    DONDE_ESTABA,
                    JSON.stringify({ pagina, porPagina })
                );

            }
            catch (error) {

                /* Sin sitio para guardarlo, se sigue igual. */

            }

        }

        contenedor.innerHTML = sinTamano
            ? `
<div class="paginacion">
    <div class="paginacion-botones">
        <button id="${id}Primero" type="button" aria-label="Primera página">«</button>
        <button id="${id}Anterior" type="button" aria-label="Página anterior">‹</button>
        <span id="${id}Numeros" class="paginacion-numeros"></span>
        <button id="${id}Siguiente" type="button" aria-label="Página siguiente">›</button>
        <button id="${id}Ultimo" type="button" aria-label="Última página">»</button>
    </div>
    <span id="${id}Estado" class="paginacion-estado" role="status"></span>
</div>
`
            : `

<div class="paginacion">

    <label for="${id}Tamano">
        Por página
    </label>

    <select id="${id}Tamano">
${TAMANOS.map(n => `
        <option value="${n}" ${String(n) === String(porPagina) ? "selected" : ""}>
            ${n}
        </option>`).join("")}
        <option value="${TODOS}">
            todos
        </option>
    </select>

    <button id="${id}Primero" type="button" aria-label="Primera página">
        « Primero
    </button>

    <button id="${id}Anterior" type="button" aria-label="Página anterior">
        ‹ Atrás
    </button>

    <span id="${id}Estado" class="paginacion-estado" role="status"></span>

    <button id="${id}Siguiente" type="button" aria-label="Página siguiente">
        Adelante ›
    </button>

    <button id="${id}Ultimo" type="button" aria-label="Última página">
        Último »
    </button>

</div>

`;

        const elemento =
            sufijo => document.getElementById(`${id}${sufijo}`);

        function paginas() {

            return porPagina === TODOS
                ? 1
                : Math.max(1, Math.ceil(total / porPagina));

        }

        function pintarEstado() {

            const cuantas =
                paginas();

            elemento("Estado").textContent =
                total === 0
                    ? "Sin registros"
                    : `Página ${pagina} de ${cuantas} · ${total} registros`;

            /*
            * Sin selector, un botón por página, como en PrimeNG. El de la
            * página en la que se está dice que lo es y no se apaga: pulsarlo
            * no hace nada, que es lo que hace allí.
            */

            if (sinTamano) {

                elemento("Numeros").innerHTML =
                    Array.from({ length: cuantas }, (_, i) => i + 1)
                        .map(n => `<button type="button" data-pagina="${n}"${n === pagina ? ' aria-current="page"' : ""}>${n}</button>`)
                        .join("");

                elemento("Numeros")
                    .querySelectorAll("[data-pagina]")
                    .forEach(boton => boton.addEventListener(
                        "click",
                        () => ir(Number(boton.dataset.pagina))
                    ));

                elemento("Estado").textContent =
                    total === 0
                        ? "Sin registros"
                        : `${Math.min(total, (pagina - 1) * porPagina + 1)} a ` +
                          `${Math.min(total, pagina * porPagina)} de ${total}`;

            }

            elemento("Primero").disabled = pagina === 1;

            elemento("Anterior").disabled = pagina === 1;

            elemento("Siguiente").disabled = pagina === cuantas;

            elemento("Ultimo").disabled = pagina === cuantas;

        }

        function ir(destino) {

            const cuantas =
                paginas();

            pagina =
                Math.min(Math.max(1, destino), cuantas);

            apuntarDondeEstoy();

            onCambio();

        }

        elemento("Tamano")?.addEventListener("change", evento => {

            const valor =
                evento.target.value;

            porPagina =
                valor === TODOS
                    ? TODOS
                    : Number(valor);

            /*
            * Al cambiar el tamaño se vuelve a la primera página.
            * Quedarse en la séptima cuando ahora sólo hay dos
            * enseñaría una tabla vacía.
            */

            pagina = 1;

            apuntarDondeEstoy();

            onCambio();

        });

        elemento("Primero").addEventListener("click", () => ir(1));

        elemento("Anterior").addEventListener("click", () => ir(pagina - 1));

        elemento("Siguiente").addEventListener("click", () => ir(pagina + 1));

        elemento("Ultimo").addEventListener("click", () => ir(paginas()));

        return {

            /*
            * El trozo de la lista que toca enseñar. Se ajusta la
            * página si se ha quedado fuera: borrando el último
            * registro de la última página, esa página deja de
            * existir.
            */

            recortar(registros) {

                total = registros.length;

                const cuantas =
                    paginas();

                if (pagina > cuantas) {

                    pagina = cuantas;

                }

                pintarEstado();

                if (porPagina === TODOS) {

                    return registros;

                }

                const desde =
                    (pagina - 1) * porPagina;

                return registros.slice(desde, desde + porPagina);

            }

        };

    }

    return {

        TAMANOS,

        POR_DEFECTO,

        crear

    };

})();
