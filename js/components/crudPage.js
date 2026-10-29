/*
|--------------------------------------------------------------------------
| CrudPage
|--------------------------------------------------------------------------
|
| El listado de una pantalla: la tabla, el buscador, el botón de
| alta, la ordenación por columna, la selección múltiple y la
| paginación.
|
| Todo el repintado pasa por aquí. Antes cada formulario y cada
| borrado llamaban a `renderTable(repositorio.findAll())` por su
| cuenta, y eso volvía a pintar la lista entera: se perdía la
| página, el orden y lo que hubieras escrito en el buscador.
|
| El orden en que se aplican las cosas importa, y es éste:
|
|     buscar  ->  ordenar  ->  paginar
|
| Buscar primero, porque el buscador filtra sobre todo lo que
| hay. Ordenar después, sobre lo filtrado. Y paginar al final,
| que es lo único que decide qué se enseña. Al revés —paginar y
| luego ordenar— sólo se ordenaría la página que se está viendo,
| que es el error clásico.
|
*/

const CrudPage = (() => {

    /*
    * La pantalla que está montada. Nula en una ficha, donde no
    * hay listado: pedir un repintado allí no hace nada.
    */

    let actual = null;

    function pintar() {

        if (!actual) {

            return;

        }

        const { config, paginador, ordenador, seleccion, filtro } = actual;

        const encontrados =
            filtro
                ? config.repository.search(filtro)
                : config.repository.findAll();

        /*
        * Dos órdenes que no pueden mandar a la vez: el de la
        * columna que se haya pulsado y el que haya puesto alguien
        * a mano arrastrando las filas.
        *
        * Manda la columna mientras haya una puesta, porque es lo
        * que se acaba de pedir. Sin columna, mandan las filas
        * como se dejaron.
        */

        const ordenados =
            ordenador?.activo()
                ? ordenador.ordenar(encontrados)
                : (typeof Orden !== "undefined"
                    ? Orden.aplicar(config.entity, encontrados)
                    : encontrados);

        const visibles =
            paginador
                ? paginador.recortar(ordenados)
                : ordenados;

        /*
        * Se pasan los dos: la página y todo lo que la búsqueda ha
        * dejado.
        *
        * Una tabla enseña una página. Un kanban no: reparte las
        * tarjetas en columnas por su estado, y recortarlo a cinco
        * dejaría cinco tarjetas repartidas entre cinco columnas, que
        * no es una vista de nada. La paginación es de la tabla, no
        * de los datos.
        *
        * Quien sólo pinta una tabla ignora el segundo argumento y
        * sigue funcionando igual.
        */

        config.ui.renderTable(visibles, ordenados);

        seleccion?.enganchar(visibles.map(r => r.id));

        colocar();

    }

    /*
    * Deja las filas listas para arrastrarlas.
    *
    * Se rehace en cada pintado porque las filas son otras: la
    * tabla se vuelve a escribir entera al buscar, al ordenar y al
    * pasar de página.
    *
    * Al soltar no se guarda sólo lo que se ve. Con la lista
    * paginada, guardar la página como si fuera el orden entero
    * perdería el de las demás: se colocan los identificadores
    * movidos en los huecos que ocupaban.
    */

    /*
    * Los botones de colocar una fila sin arrastrar, si esta pantalla los
    * ofrece.
    *
    * No los ofrecen todas a propósito: la lista que los tiene es el caso que
    * cumple el 2.5.7 de la WCAG y las demás son el que no, y la plataforma
    * tiene que distinguir los dos.
    *
    * Con una columna ordenando salen apagados, por lo mismo que el tirador:
    * lo que se ve entonces no es el orden de nadie.
    */

    function botonesDeColocar(id, posicion) {

        if (!actual?.config.colocarConBotones || !posicion ||
            typeof Orden === "undefined") {

            return "";

        }

        return Orden.botones({

            id,

            primera:
                posicion.primera,

            ultima:
                posicion.ultima,

            sePuede:
                !actual.ordenador?.activo()

        });

    }

    /*
    * Mover una fila un puesto arriba o abajo.
    *
    * Hace lo mismo que soltar una fila arrastrada y por eso termina igual:
    * el orden se guarda entero y no sólo lo que se ve. Se mueve dentro de la
    * página, que es hasta donde llega también el arrastre.
    */

    function mover(id, direccion) {

        const { config } = actual;

        const filas =
            [...document.querySelectorAll(`${config.tabla} tbody tr`)]
                .map(fila => fila.querySelector("input.seleccion")?.dataset.id)
                .filter(Boolean);

        const donde =
            filas.indexOf(String(id));

        const destino =
            direccion === "arriba" ? donde - 1 : donde + 1;

        if (donde < 0 || destino < 0 || destino >= filas.length) {

            return;

        }

        [filas[donde], filas[destino]] =
            [filas[destino], filas[donde]];

        Orden.colocar(

            config.entity,

            filas,

            Orden

                .aplicar(
                    config.entity,
                    config.repository.findAll()
                )

                .map(r => r.id)

        );

        pintar();

    }

    function colocar() {

        if (!actual || typeof Orden === "undefined") {

            return;

        }

        const { config, ordenador } = actual;

        const tabla =
            document.querySelector(config.tabla);

        /*
        * Los botones de colocar, si los hay. Se escucha en el cuerpo de la
        * tabla y no en cada botón: las filas se vuelven a escribir enteras en
        * cada pintado, y enganchar uno por fila fue exactamente lo que hizo
        * que un clic en el dashboard mandara veintidós peticiones.
        *
        * Y se asigna la propiedad en lugar de añadir un oyente, que es lo que
        * hace que repintar no vaya sumando manejadores.
        */

        const cuerpo =
            tabla?.querySelector("tbody");

        if (cuerpo && config.colocarConBotones) {

            cuerpo.onclick = evento => {

                const boton =
                    evento.target.closest("[data-mover]");

                if (!boton || boton.disabled) {

                    return;

                }

                mover(boton.dataset.id, boton.dataset.mover);

            };

        }

        Orden.conectar({

            contenedor:
                tabla?.querySelector("tbody"),

            selector:
                "tr",

            idDe:
                fila => fila.querySelector("input.seleccion")?.dataset.id,

            sePuede:
                () => !ordenador?.activo(),

            alSoltar:
                ids => {

                    /*
                    * El orden se guarda entero, no sólo lo que
                    * pasa el buscador: con "Bos" escrito se ven
                    * dos empresas de catorce, y guardar esas dos
                    * como si fueran la lista dejaría a las otras
                    * doce sin sitio.
                    */

                    Orden.colocar(

                        config.entity,

                        ids,

                        Orden

                            .aplicar(
                                config.entity,
                                config.repository.findAll()
                            )

                            .map(r => r.id)

                    );

                    pintar();

                }

        });

    }

    /*
    * Lo que cuelga de un registro. Lo declara cada pantalla en su
    * configuración, y lo usan los dos borrados: el de una fila y
    * el de lo seleccionado.
    */

    function dependencias(registro) {

        return Relations.de(
            actual?.config.dependenciasDe?.(registro) || []
        );

    }

    /*
    * Borrar lo seleccionado.
    *
    * Los que tienen relaciones no se borran, y se dice cuántos:
    * borrar la mitad callando la otra mitad sería peor que no
    * borrar nada.
    */

    async function borrarSeleccion(ids) {

        const { config, seleccion } = actual;

        const registros =
            ids.map(id => config.repository.findById(id)).filter(Boolean);

        const bloqueados =
            registros.filter(r => dependencias(r).length);

        const borrables =
            registros.filter(r => !dependencias(r).length);

        if (!borrables.length) {

            Toast.error(
                `Ninguno de los ${registros.length} seleccionados se puede eliminar: todos tienen relaciones.`
            );

            return;

        }

        const confirmado = confirm(
            `¿Eliminar ${borrables.length} ${borrables.length === 1 ? "registro" : "registros"}?` +
            (bloqueados.length
                ? `\n\n${bloqueados.length} ${bloqueados.length === 1 ? "no se puede" : "no se pueden"} eliminar porque ${bloqueados.length === 1 ? "tiene relaciones y se queda" : "tienen relaciones y se quedan"}.`
                : "")
        );

        if (!confirmado) {

            return;

        }

        for (const registro of borrables) {

            config.repository.remove(registro.id);

        }

        seleccion.olvidar();

        pintar();

    }

    function create(config) {

        config.repository.load();

        actual = {

            config,

            filtro: "",

            ordenador:
                config.columnas
                    ? Sortable.crear({

                        tabla: config.tabla,

                        columnas: config.columnas,

                        onCambio: pintar

                    })
                    : null,

            seleccion:
                Selection.crear({

                    tabla: config.tabla,

                    onCambio: pintar,

                    onBorrar: borrarSeleccion

                }),

            paginador:
                Pagination.crear({

                    id: "paginacion",

                    onCambio: pintar

                })

        };

        actual.seleccion.create();

        const search =
            document.getElementById(config.searchId);

        if (search) {

            search.addEventListener("input", e => {

                actual.filtro = e.target.value;

                pintar();

            });

        }

        const newButton =
            document.getElementById(config.newButtonId);

        if (newButton) {

            newButton.addEventListener("click", () => {

                config.form.open();

            });

        }

        pintar();

    }

    return {

        create,

        pintar,

        dependencias,

        /*
        * La celda de la casilla de selección, que cada listado
        * pinta como primera columna de su fila.
        */

        /*
        * La primera celda de una fila.
        *
        * `posicion` sólo hace falta en las pantallas que dejan colocar sin
        * arrastrar: los botones de subir y bajar no están en los extremos, y
        * para saber si ésta es uno hay que decirle dónde va la fila.
        */

        celdaDeSeleccion(id, posicion = null) {

            return actual?.seleccion
                ? actual.seleccion.celda(id, botonesDeColocar(id, posicion))
                : "";

        }

    };

})();
