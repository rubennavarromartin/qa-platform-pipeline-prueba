/*
|--------------------------------------------------------------------------
| Views
|--------------------------------------------------------------------------
|
| Una pantalla con varias vistas de los mismos datos, y un botón
| que cambia de una a otra.
|
| Está aquí porque es el caso que la plataforma **no sabe
| reconocer**, y hasta ahora no había ninguno en el laboratorio:
| explora la vista que está puesta y no se entera de que hay otra.
| Un presupuesto en kanban y un presupuesto en tabla son el mismo
| registro enseñado de dos maneras; el Discovery ve una y da la
| pantalla por entendida.
|
| Y agrava lo anterior: cuando el Discovery encuentra un botón que
| no lleva a otra dirección, recarga la pantalla para dejarla como
| estaba. Justo lo que descarta la vista que se acababa de abrir.
|
| No se marca con `data-` nada que lo delate. Se podría poner un
| atributo que dijera "aquí hay dos vistas" y el Discovery lo
| leería, pero entonces el laboratorio estaría resolviendo el
| problema en lugar de plantearlo: una aplicación de verdad no
| lleva esa pista.
|
| Lo que sí lleva es el patrón de ARIA, que cualquiera puede leer:
| los botones son un grupo y el que está puesto lo dice con
| `aria-pressed`.
|
| La vista elegida se recuerda en el navegador. Una aplicación que
| te devuelve a la vista que no querías cada vez que entras es una
| aplicación que nadie usa dos veces.
|
*/

const Views = (() => {

    function clave(pantalla) {

        return `qa-platform-vista-${pantalla}`;

    }

    /*
    * config:
    *
    *   pantalla   con qué nombre se recuerda la elección
    *   inicial    cuál se enseña la primera vez
    *   vistas     [{ nombre, boton, panel, alMostrar }]
    *
    *       nombre     cómo se llama, para recordarla
    *       boton      id del botón que la pone
    *       panel      id de lo que se enseña
    *       alMostrar  qué hacer al enseñarla, si algo
    */

    function create(config) {

        const vistas =
            config.vistas

                .map(vista => ({

                    ...vista,

                    nodoBoton:
                        document.getElementById(vista.boton),

                    nodoPanel:
                        document.getElementById(vista.panel)

                }))

                .filter(vista => vista.nodoBoton && vista.nodoPanel);

        if (vistas.length < 2) {

            return null;

        }

        function mostrar(elegida) {

            /*
            * Se apunta cuál es la puesta **antes** de avisar a nadie.
            *
            * Estaba al final, y con eso el kanban se quedaba vacío al
            * cambiar a él: quien pinta pregunta por `actual()` para no
            * pintar la vista que no se ve, y `actual()` respondía
            * todavía "tabla", así que pintaba la tabla —escondida— y
            * el tablero se quedaba sin tarjetas.
            *
            * Al cargar la página no se notaba, porque la pantalla
            * vuelve a pintarse después de montar el conmutador y para
            * entonces ya estaba apuntado. Sólo se veía cambiando de
            * vista a mano, y ninguna prueba cambiaba dos veces: lo
            * encontró el primer caso de uso, que pide la tabla en un
            * paso y el tablero en el siguiente.
            */

            localStorage.setItem(clave(config.pantalla), elegida);

            for (const vista of vistas) {

                const activa =
                    vista.nombre === elegida;

                vista.nodoPanel.hidden = !activa;

                vista.nodoBoton.setAttribute(
                    "aria-pressed",
                    String(activa)
                );

                /*
                * El botón de la vista que ya está puesta se
                * desactiva: pulsarlo no haría nada, y un botón que
                * no hace nada es un botón que sobra.
                */

                vista.nodoBoton.disabled = activa;

                if (activa) {

                    vista.alMostrar?.();

                }

            }

        }

        for (const vista of vistas) {

            vista.nodoBoton.addEventListener("click", () => {

                mostrar(vista.nombre);

            });

        }

        const recordada =
            localStorage.getItem(clave(config.pantalla));

        mostrar(
            vistas.some(v => v.nombre === recordada)
                ? recordada
                : config.inicial
        );

        return {

            mostrar,

            /*
            * Cuál está puesta. Lo pregunta quien tenga que
            * repintar: repintar la que no se ve es trabajo tirado,
            * y en el kanban es trabajo caro.
            */

            actual() {

                return localStorage.getItem(clave(config.pantalla));

            }

        };

    }

    return {

        create

    };

})();
