/*
|--------------------------------------------------------------------------
| Calendario
|--------------------------------------------------------------------------
|
| Elegir una fecha en un calendario propio, y no en el `input type="date"`
| del navegador.
|
| Es el `p-datepicker` de PrimeNG tal como lo usan las altas de SABESP
| —"Inicio da vigencia" y "Termino da vigencia" de Contratos—, medido el 16
| de octubre de 2026, y está copiado en lo que importa para quien lo mira de
| fuera:
|
|   - El campo es de texto con `role="combobox"` y **`aria-haspopup="dialog"`**:
|     no despliega una lista de sugerencias, abre un calendario. Tomarlo por
|     un autocompletado es esperar sugerencias que no llegan nunca, y así se
|     saltaban 35 pruebas de SABESP.
|   - El calendario se cuelga del `body` y el campo lo señala con
|     `aria-controls` sólo mientras está abierto.
|   - Los días son una tabla con `role="grid"`, con los del mes de antes y el
|     de después en las filas de los extremos.
|   - La fecha se escribe en el formato de la aplicación —día, mes y año con
|     barras—, que no es el que entiende un `input type="date"`.
|   - Elegir un día no lo cierra; se cierra al salir del campo con Tab, o con
|     Escape, que no cierra el formulario de debajo.
|
| Y **callado**, que es el `p-calendar` de PrimeNG tal como lo usa Bitácora:
| el mismo calendario sin decir nada de sí mismo. El campo es texto sin papel,
| sin `aria-haspopup` y sin `aria-controls`, y la tabla de días no se declara
| rejilla. Medido en "Nuevo viaje" el 21 de octubre de 2026. La pregunta que
| plantea es si se reconoce un calendario por lo que hace —al pulsar el campo
| aparece una cuadrícula de días— y se rellena eligiendo un día, cuando nada
| dice que lo sea.
|
*/

const Calendario = (() => {

    let contador = 0;

    const MESES = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
        "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const dosCifras = numero => String(numero).padStart(2, "0");

    /*
    * Lo que se guarda va en ISO, como en todo el laboratorio; lo que se ve,
    * con barras. Las dos vueltas, en un sitio.
    */

    function aTexto(iso) {

        const [anio, mes, dia] = String(iso || "").split("-");

        return anio && mes && dia ? `${dia}/${mes}/${anio}` : "";

    }

    function aIso(texto) {

        const [dia, mes, anio] = String(texto || "").split("/");

        return anio && mes && dia ? `${anio}-${dosCifras(mes)}-${dosCifras(dia)}` : "";

    }

    function montar(id, { callado = false } = {}) {

        const campo =
            document.getElementById(id);

        if (!campo) {

            return;

        }

        const idPanel =
            `calendario_${++contador}_panel`;

        /*
        * Lo que dice de sí mismo, y sólo si no va callado. Envuelto en una
        * función para que callarlo sea callarlo en todas partes: abrir y
        * cerrar también tocan atributos.
        */

        const decir = (atributo, valor) => {

            if (!callado) {

                campo.setAttribute(atributo, valor);

            }

        };

        decir("role", "combobox");

        decir("aria-haspopup", "dialog");

        decir("aria-expanded", "false");

        campo.setAttribute("autocomplete", "off");

        let panel = null;

        let mostrado = new Date();

        function cerrar() {

            panel?.remove();

            panel = null;

            campo.removeAttribute("aria-controls");

            decir("aria-expanded", "false");

        }

        function pintar() {

            const anio = mostrado.getFullYear();

            const mes = mostrado.getMonth();

            /*
            * Seis semanas empezando en lunes, con los días que sobran del mes
            * de antes y del de después, como cualquier calendario.
            */

            const primero = new Date(anio, mes, 1);

            const desde = new Date(anio, mes, 1 - ((primero.getDay() + 6) % 7));

            const celdas = Array.from({ length: 42 }, (_, cual) =>
                new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + cual));

            const filas = Array.from({ length: 6 }, (_, semana) => `
<tr>${celdas.slice(semana * 7, semana * 7 + 7).map(dia => `
    <td class="${dia.getMonth() === mes ? "" : "otro-mes"}"
        data-fecha="${dia.getFullYear()}-${dosCifras(dia.getMonth() + 1)}-${dosCifras(dia.getDate())}">
        ${dia.getDate()}
    </td>`).join("")}
</tr>`).join("");

            panel.innerHTML = `
<div class="calendario-cabecera">
    <button type="button" class="calendario-antes" aria-label="Mes anterior">‹</button>
    <span>${MESES[mes]} de ${anio}</span>
    <button type="button" class="calendario-despues" aria-label="Mes siguiente">›</button>
</div>
<table${callado ? "" : ` role="grid"`}>
    <thead><tr>${["lu", "ma", "mi", "ju", "vi", "sá", "do"].map(dia => `<th>${dia}</th>`).join("")}</tr></thead>
    <tbody>${filas}</tbody>
</table>`;

        }

        function abrir() {

            if (panel) {

                return;

            }

            panel = document.createElement("div");

            panel.id = idPanel;

            panel.className = "calendario-panel";

            if (!callado) {

                panel.setAttribute("role", "dialog");

                panel.setAttribute("aria-label", "Elegir una fecha");

            }

            const iso = aIso(campo.value);

            mostrado = iso ? new Date(`${iso}T00:00:00`) : new Date();

            pintar();

            const caja = campo.getBoundingClientRect();

            panel.style.left = `${caja.left + window.scrollX}px`;

            panel.style.top = `${caja.bottom + window.scrollY + 4}px`;

            document.body.appendChild(panel);

            decir("aria-controls", idPanel);

            decir("aria-expanded", "true");

            /*
            * Pulsar dentro no puede quitarle el foco al campo, o se cerraría
            * antes de elegir: el cierre va con el blur.
            */

            panel.addEventListener("mousedown", evento => evento.preventDefault());

            panel.addEventListener("click", evento => {

                if (evento.target.closest(".calendario-antes")) {

                    mostrado = new Date(mostrado.getFullYear(), mostrado.getMonth() - 1, 1);

                    pintar();

                    return;

                }

                if (evento.target.closest(".calendario-despues")) {

                    mostrado = new Date(mostrado.getFullYear(), mostrado.getMonth() + 1, 1);

                    pintar();

                    return;

                }

                const celda = evento.target.closest("td[data-fecha]");

                if (celda) {

                    campo.value = aTexto(celda.dataset.fecha);

                    campo.dispatchEvent(new Event("input", { bubbles: true }));

                    campo.dispatchEvent(new Event("change", { bubbles: true }));

                }

            });

        }

        campo.addEventListener("focus", abrir);

        campo.addEventListener("click", abrir);

        campo.addEventListener("blur", cerrar);

        campo.addEventListener("keydown", evento => {

            if (evento.key === "Escape" && panel) {

                evento.stopPropagation();

                cerrar();

            }

        });

    }

    return { montar, aTexto, aIso };

})();
