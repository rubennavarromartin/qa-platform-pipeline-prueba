/*
|--------------------------------------------------------------------------
| Autocomplete
|--------------------------------------------------------------------------
|
| Escribir y elegir de una lista que aparece debajo.
|
| Con catorce contactos un desplegable ya se hace largo, y con
| doscientos es inservible. Es el componente que sustituye al
| desplegable en cuanto una aplicación crece.
|
| Se implementa con el patrón `combobox` de ARIA y no con un
| invento: el campo es un `combobox` que dice si está abierto y a
| qué lista apunta, y la lista es un `listbox` de `option`. Un
| lector de pantalla lo anuncia, se maneja con las flechas, y
| —esto es lo que interesa aquí— quien lo mire de fuera puede
| reconocerlo por los papeles y no por las clases de CSS.
|
| Sólo vale lo que esté en la lista. Escribir algo y marcharse no
| elige nada: por eso hay un campo oculto con lo elegido, y lo
| escrito a mano se descarta al salir. Un autocompletado que
| acepta texto libre no es un autocompletado, es una caja de
| texto con adornos.
|
| Y **callado**, que es el `p-autocomplete` de PrimeNG tal como lo usa
| Bitácora —"Proyecto" y las ciudades de "Nuevo viaje", medido el 21 de
| octubre de 2026—. Cuatro cosas lo separan del de arriba, y las cuatro las
| tropezó la plataforma:
|
|   - No se dice `combobox`: es un `searchbox` con `aria-autocomplete="list"`.
|   - No sugiere nada al abrirlo. Pregunta con lo que se teclea, así que hasta
|     que se escribe algo no hay lista.
|   - La lista cuelga del `body`, fuera del diálogo del alta.
|   - Se cierra con una animación, y mientras dura sigue a la vista.
|
| Y cuando no encuentra nada lo dice con una línea que no es una opción.
|
*/

const Autocomplete = (() => {

    function crear({ campo, valores, alElegir, callado = false }) {

        const entrada =
            document.getElementById(campo);

        if (!entrada) {

            return;

        }

        const lista =
            document.getElementById(`${campo}Lista`);

        const elegido =
            document.getElementById(`${campo}Valor`);

        let cerrandose = null;

        if (callado) {

            entrada.setAttribute("role", "searchbox");

            entrada.setAttribute("aria-autocomplete", "list");

            entrada.removeAttribute("aria-expanded");

            /*
            * Fuera del diálogo, como la de PrimeNG. La de un alta anterior
            * puede seguir colgando del `body` con el mismo identificador: se
            * quita antes, que el diálogo se pinta de nuevo cada vez.
            */

            document
                .querySelectorAll(`body > #${campo}Lista`)
                .forEach(vieja => vieja !== lista && vieja.remove());

            document.body.appendChild(lista);

            lista.style.position = "absolute";

            lista.style.zIndex = "1100";

            lista.style.background = "#fff";

            lista.style.border = "1px solid #c8ccd4";

            lista.style.listStyle = "none";

            lista.style.margin = "0";

            lista.style.padding = "4px 0";

            lista.style.transition = "opacity 250ms";

        }

        const decir = (atributo, valor) => {

            if (!callado) {

                entrada.setAttribute(atributo, valor);

            }

        };

        function cerrar() {

            decir("aria-expanded", "false");

            if (!callado) {

                lista.hidden = true;

                return;

            }

            if (lista.hidden || cerrandose) {

                return;

            }

            lista.style.opacity = "0";

            cerrandose = setTimeout(() => {

                lista.hidden = true;

                lista.style.opacity = "1";

                cerrandose = null;

            }, 250);

        }

        function elegir(valor) {

            entrada.value = valor;

            elegido.value = valor;

            cerrar();

            alElegir?.(valor);

        }

        function abrir(sugerencias) {

            clearTimeout(cerrandose);

            cerrandose = null;

            lista.style.opacity = "1";

            lista.innerHTML =
                sugerencias

                    .map(valor => `
                    <li
                        role="option"
                        tabindex="-1"
                        aria-selected="false">${valor}</li>`)

                    .join("") ||

                (callado ? `<li class="sin-resultados">No se encontraron resultados</li>` : "");

            lista.hidden = !callado && sugerencias.length === 0;

            if (callado) {

                const caja = entrada.getBoundingClientRect();

                lista.style.left = `${caja.left + window.scrollX}px`;

                lista.style.top = `${caja.bottom + window.scrollY + 2}px`;

                lista.style.minWidth = `${caja.width}px`;

            }

            decir(
                "aria-expanded",
                String(sugerencias.length > 0)
            );

            lista

                .querySelectorAll("[role='option']")

                .forEach(opcion => {

                    opcion.onclick = () => elegir(opcion.textContent.trim());

                });

        }

        entrada.addEventListener("input", () => {

            /*
            * Al escribir se deja de tener nada elegido: lo que
            * hay en el campo todavía no es una elección.
            */

            elegido.value = "";

            const escrito =
                entrada.value.trim().toLowerCase();

            abrir(
                valores().filter(valor =>
                    valor.toLowerCase().includes(escrito)
                )
            );

        });

        entrada.addEventListener("focus", () => {

            if (!callado) {

                abrir(valores());

            }

        });

        /*
        * Al salir del campo, lo escrito que no sea una elección
        * se descarta. Si no, quedaría un texto que parece un
        * contacto y no lo es.
        *
        * Con un respiro, porque salir del campo para pulsar una
        * sugerencia también es salir del campo.
        */

        entrada.addEventListener("blur", () => {

            setTimeout(() => {

                if (!elegido.value) {

                    entrada.value = "";

                }

                cerrar();

            }, 150);

        });

    }

    return {

        crear

    };

})();
