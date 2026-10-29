/*
|--------------------------------------------------------------------------
| Tabs
|--------------------------------------------------------------------------
|
| Pestañas dentro de una pantalla. Cada grupo funcional tiene al
| menos dos: su listado y su documentación.
|
| Se sigue el patrón de ARIA en lugar de inventarse otro: la
| barra es un `tablist`, cada botón un `tab` que apunta con
| `aria-controls` a su `tabpanel`, y las flechas del teclado
| mueven entre pestañas. Un lector de pantalla anuncia entonces
| "pestaña 2 de 3, seleccionada", que es lo que hay que anunciar.
|
| El panel que no toca se esconde con `hidden`, no con una clase:
| así no lo lee nadie que no deba, ni una persona ni un programa.
|
| Al cambiar de pestaña se avisa con un evento `pestana`. Lo que
| viva dentro de un panel puede necesitar repintarse cuando se
| enseña, y no tiene por qué enterarse preguntando.
|
*/

const Tabs = (() => {

    const BARRA = "[role='tablist']";

    function paneles(barra) {

        return [...barra.querySelectorAll("[role='tab']")]

            .map(tab => ({

                tab,

                panel:
                    document.getElementById(
                        tab.getAttribute("aria-controls")
                    )

            }))

            .filter(par => par.panel);

    }

    function mostrar(barra, elegido) {

        for (const { tab, panel } of paneles(barra)) {

            const activa =
                tab === elegido;

            tab.setAttribute("aria-selected", String(activa));

            /*
            * Sólo la pestaña activa entra en el recorrido del
            * tabulador. Las demás se alcanzan con las flechas,
            * que es como se espera que funcione una barra de
            * pestañas.
            */

            tab.tabIndex = activa ? 0 : -1;

            panel.hidden = !activa;

            if (activa) {

                document.dispatchEvent(

                    new CustomEvent("pestana", {

                        detail: {

                            tab: tab.id,

                            panel: panel.id

                        }

                    })

                );

            }

        }

    }

    function mover(barra, desde, salto) {

        const tabs =
            paneles(barra).map(par => par.tab);

        const siguiente =
            (tabs.indexOf(desde) + salto + tabs.length) % tabs.length;

        tabs[siguiente].focus();

        mostrar(barra, tabs[siguiente]);

    }

    function create() {

        for (const barra of document.querySelectorAll(BARRA)) {

            const pares =
                paneles(barra);

            if (!pares.length) {

                continue;

            }

            for (const { tab } of pares) {

                tab.addEventListener("click", () => {

                    mostrar(barra, tab);

                });

                tab.addEventListener("keydown", evento => {

                    if (evento.key === "ArrowRight") {

                        mover(barra, tab, 1);

                    }

                    if (evento.key === "ArrowLeft") {

                        mover(barra, tab, -1);

                    }

                });

            }

            /*
            * La de partida es la que venga marcada, y si no
            * viene ninguna, la primera.
            */

            const inicial =
                pares.find(
                    par => par.tab.getAttribute("aria-selected") === "true"
                ) || pares[0];

            mostrar(barra, inicial.tab);

        }

    }

    document.addEventListener("DOMContentLoaded", create);

    /*
    * Abrir una pestaña desde código, por su identificador.
    *
    * Hace falta cuando una acción de otra pestaña lleva a ésta:
    * "ver los contactos de esta empresa" está en el listado y
    * enseña la pestaña de al lado.
    */

    function abrir(tabId) {

        const tab =
            document.getElementById(tabId);

        const barra =
            tab?.closest(BARRA);

        if (!tab || !barra) {

            return;

        }

        mostrar(barra, tab);

    }

    return {

        create,

        mostrar,

        abrir

    };

})();
