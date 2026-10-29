/*
|--------------------------------------------------------------------------
| Multiselect
|--------------------------------------------------------------------------
|
| Elegir varias opciones de una lista que se despliega, y que no filtra
| hasta que se pulsa "Aplicar".
|
| Es el `p-multiselect` de PrimeNG tal como lo usa SABESP en sus filtros de
| Unidades —Municipio, Regional, Distribuidora y Tipo—, medido el 15 de
| octubre de 2026, y está copiado en lo que importa para quien lo mira de
| fuera, no en el aspecto:
|
|   - El campo que tiene el nombre es un `input` **escondido** con
|     `role="combobox"` y `aria-haspopup="listbox"`, y la etiqueta apunta a
|     él con `for`. Lo que se ve es su contenedor, que no es un control:
|     un lector que sólo mire lo visible no encuentra el campo, y uno que
|     sólo mire los campos lo encuentra escondido.
|   - La lista se cuelga del `body` y no de dentro del componente, así que
|     no se encuentra buscando dentro de él. Se llega por `aria-controls`.
|   - Cada opción es un `option` con `aria-selected`, y arriba hay una
|     casilla de "todas".
|   - Se abre pulsando el contenedor o con las flechas desde el campo, y se
|     cierra con Escape o pulsando fuera.
|   - Enseña "Todos" sin nada elegido, y lo elegido cuando hay algo.
|
| Y lo que hace que sea una pregunta nueva para la plataforma: **elegir no
| cambia nada**. La pantalla filtra cuando se pulsa un botón aparte, y ese
| botón, pulsado solo, tampoco hace nada.
|
*/

const Multiselect = (() => {

    let contador = 0;

    function crear({ campo, opciones, vacio = "Todos" }) {

        const entrada =
            document.getElementById(campo);

        if (!entrada) {

            return null;

        }

        const raiz =
            entrada.closest(".multiselect");

        const rotulo =
            raiz.querySelector(".multiselect-rotulo");

        const idLista =
            `multiselect_${++contador}_lista`;

        const elegidas =
            new Set();

        /*
        * Colgada del documento, como la de PrimeNG con `appendTo="body"`.
        */

        const panel =
            document.createElement("div");

        panel.className = "multiselect-panel";

        panel.hidden = true;

        document.body.appendChild(panel);

        entrada.setAttribute("aria-controls", idLista);

        function pintarRotulo() {

            rotulo.textContent =
                elegidas.size ? [...elegidas].join(", ") : vacio;

            rotulo.classList.toggle("multiselect-vacio", !elegidas.size);

        }

        function pintarPanel() {

            const todas =
                opciones().length > 0 && elegidas.size === opciones().length;

            panel.innerHTML = `
<label class="multiselect-todas">
    <input type="checkbox" ${todas ? "checked" : ""}
        aria-label="${todas ? "Todas elegidas" : "Ninguna elegida"}">
</label>
<ul role="listbox" id="${idLista}" aria-multiselectable="true">
    ${opciones().map(opcion => `
    <li role="option" aria-label="${opcion}"
        aria-selected="${elegidas.has(opcion)}">
        <input type="checkbox" tabindex="-1" aria-hidden="true"
            ${elegidas.has(opcion) ? "checked" : ""}>${opcion}
    </li>`).join("")}
</ul>`;

        }

        function abrir() {

            pintarPanel();

            const caja =
                raiz.getBoundingClientRect();

            panel.style.left = `${caja.left + window.scrollX}px`;

            panel.style.top = `${caja.bottom + window.scrollY + 4}px`;

            panel.style.minWidth = `${caja.width}px`;

            panel.hidden = false;

            entrada.setAttribute("aria-expanded", "true");

        }

        function cerrar() {

            panel.hidden = true;

            entrada.setAttribute("aria-expanded", "false");

        }

        function alternar(opcion) {

            if (elegidas.has(opcion)) {

                elegidas.delete(opcion);

            }
            else {

                elegidas.add(opcion);

            }

            pintarPanel();

            pintarRotulo();

        }

        raiz.addEventListener("click", () =>
            panel.hidden ? abrir() : cerrar());

        entrada.addEventListener("keydown", evento => {

            if (["ArrowDown", "Enter", " "].includes(evento.key)) {

                evento.preventDefault();

                abrir();

            }

            if (evento.key === "Escape") {

                cerrar();

            }

        });

        panel.addEventListener("click", evento => {

            evento.stopPropagation();

            const opcion =
                evento.target.closest("[role=option]");

            if (opcion) {

                alternar(opcion.getAttribute("aria-label"));

                return;

            }

            if (evento.target.closest(".multiselect-todas input")) {

                const todas =
                    elegidas.size === opciones().length;

                elegidas.clear();

                if (!todas) {

                    opciones().forEach(una => elegidas.add(una));

                }

                pintarPanel();

                pintarRotulo();

            }

        });

        document.addEventListener("keydown", evento => {

            if (evento.key === "Escape" && !panel.hidden) {

                cerrar();

            }

        });

        document.addEventListener("click", evento => {

            if (!panel.hidden && !raiz.contains(evento.target)) {

                cerrar();

            }

        });

        pintarRotulo();

        return {

            elegidas: () => [...elegidas],

            limpiar() {

                elegidas.clear();

                pintarRotulo();

            }

        };

    }

    return { crear };

})();
