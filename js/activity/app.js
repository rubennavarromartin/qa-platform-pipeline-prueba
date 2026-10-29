/*
|--------------------------------------------------------------------------
| Actividad
|--------------------------------------------------------------------------
|
| La pantalla que enseña el log: quién ha hecho qué y cuándo.
|
| No usa CrudPage —que es lo que monta las demás— porque aquí no
| hay ningún CRUD: no se da de alta una línea de log ni se edita,
| y borrar es borrarlo entero. Lo único que comparte con las
| demás listas es la paginación, y ésa sí se reutiliza.
|
| Es una pantalla de sólo lectura, y para la plataforma es un
| caso que no tenía: una tabla sin botones por fila y sin
| formulario detrás.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const cuerpo =
        document.querySelector("#activityGrid tbody");

    const vacio =
        document.getElementById("activityVacio");

    const filtroEntidad =
        document.getElementById("logEntidad");

    const filtroAccion =
        document.getElementById("logAccion");

    const buscador =
        document.getElementById("fActividad");

    /*
    * El de varias opciones guarda lo elegido y no filtra: lo que filtra es lo
    * aplicado, que sólo cambia al pulsar "Aplicar". Es la diferencia que hay
    * que poder ver desde fuera.
    */

    const filtroUsuario =
        Multiselect.crear({

            campo: "logUsuario",

            opciones: () => Log.usuarios()

        });

    let usuariosAplicados = [];

    if (!cuerpo) {

        return;

    }

    /*
    * Sin selector de tamaño y de cinco en cinco, como el paginador de
    * PrimeNG de SABESP. Es la pantalla que más registros trae sin que nadie
    * cree ninguno, y con catorce salen tres páginas.
    */

    const paginacion =
        Pagination.crear({

            id: "paginacion",

            onCambio: pintar,

            sinTamano: true,

            tamano: 5

        });

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    /*
    * Las entidades del desplegable salen de lo que hay anotado.
    * Se conserva lo elegido al repintar: cambiar de filtro no
    * puede deshacer el filtro.
    */

    function pintarEntidades() {

        const elegida =
            filtroEntidad.value;

        filtroEntidad.innerHTML =

            `<option value="">Todas</option>` +

            Log.entidades()
                .map(entidad =>
                    `<option value="${escapar(entidad)}">${escapar(entidad)}</option>`)
                .join("");

        filtroEntidad.value = elegida;

    }

    /*
    * La acción se pinta con el mismo distintivo que los estados
    * de las demás pantallas: una baja en rojo y un alta en verde
    * se leen de un vistazo, que es lo que se viene a hacer a un
    * log.
    */

    function distintivo(accion) {

        const clases = {

            [Log.ACCIONES.ALTA]: "active",

            [Log.ACCIONES.EDICION]: "pending",

            [Log.ACCIONES.BAJA]: "inactive"

        };

        return `<span class="badge ${clases[accion] || "inactive"}">${escapar(accion)}</span>`;

    }

    let orden = "none";

    function pintar() {

        const lineas =
            Log.filtrar({

                entidad: filtroEntidad.value,

                accion: filtroAccion.value,

                texto: buscador.value,

                usuarios: usuariosAplicados

            });

        /*
        * Se ordena la lista entera antes de recortar la página, que es lo
        * que hace un servidor: con la tabla paginada, ordenar trae otras
        * filas y no las mismas en otro orden.
        */

        if (orden !== "none") {

            const signo =
                orden === "ascending" ? 1 : -1;

            lineas.sort((una, otra) =>
                signo * String(una.usuario).localeCompare(
                    String(otra.usuario),
                    undefined,
                    { numeric: true, sensitivity: "base" }
                )
            );

        }

        const pagina =
            paginacion
                ? paginacion.recortar(lineas)
                : lineas;

        cuerpo.innerHTML =

            pagina.map(linea => `
<tr>
    <td>${escapar(Log.cuando(linea.fecha))}</td>
    <td>${escapar(linea.usuario)}</td>
    <td>${escapar(linea.entidad)}</td>
    <td>${distintivo(linea.accion)}</td>
    <td>${escapar(linea.registro)}</td>
    <td>${escapar(linea.detalle)}</td>
    <td>
        <button
            type="button"
            class="btn-delete quitarLinea"
            data-fecha="${escapar(linea.fecha)}">
            Eliminar
        </button>
    </td>
</tr>`).join("");

        vacio.textContent =
            lineas.length
                ? ""
                : "No hay actividad anotada todavía.";

    }

    [filtroEntidad, filtroAccion].forEach(filtro =>
        filtro.addEventListener("change", pintar));

    /*
    * Aplicar y Limpiar, con el retraso de una respuesta del servidor. Pulsado
    * sin haber elegido nada, Aplicar vuelve a pintar lo mismo: para quien
    * pulsa a ver qué hace, no hace nada.
    */

    document.getElementById("aplicarFiltros").addEventListener("click", () => {

        usuariosAplicados = filtroUsuario.elegidas();

        setTimeout(pintar, 700);

    });

    document.getElementById("limpiarFiltros").addEventListener("click", () => {

        filtroUsuario.limpiar();

        usuariosAplicados = [];

        setTimeout(pintar, 700);

    });

    /*
    * Filtra al confirmar con Enter y no al escribir, y con el retraso de una
    * respuesta del servidor: el buscador de SABESP. Una plataforma que
    * escribe, espera medio segundo y cuenta filas no lo ve filtrar nunca.
    */

    const cabeceraUsuario =
        document.getElementById("ordenUsuario");

    cabeceraUsuario?.addEventListener("click", () => {

        orden =
            orden === "ascending" ? "descending" : "ascending";

        cabeceraUsuario.setAttribute("aria-sort", orden);

        pintar();

    });

    /*
    * Quitar una línea. Es la pregunta que hace falta para una prueba de
    * borrar sobre una tabla que pagina en el servidor: la pantalla no tiene
    * alta, así que la prueba borra la primera fila que haya, y al quitarla
    * entra la sexta y siguen siendo cinco. Es lo que hace la rejilla de
    * SABESP, medido el 16 de octubre de 2026: contar no vale ahí.
    *
    * "Eliminar" en la fila y "Quitar" en la confirmación. Con "Quitar" en
    * la fila el Discovery no la reconoce como borrado —la acción de un botón
    * con nombre se saca de su texto—, y esta pantalla va de contar filas, no
    * de palabras; la confirmación sí prueba que se acepte sin ellas.
    */

    cuerpo.addEventListener("click", async evento => {

        const boton =
            evento.target.closest(".quitarLinea");

        if (!boton) {

            return;

        }

        const seguro =
            await Confirm.pedir({

                titulo: "Quitar la línea",

                texto: "Se quitará esta línea de la actividad.",

                aceptar: "Quitar"

            });

        if (!seguro) {

            return;

        }

        Log.quitar(boton.dataset.fecha);

        pintar();

    });

    buscador.addEventListener("keydown", evento => {

        if (evento.key === "Enter") {

            setTimeout(pintar, 1200);

        }

    });

    /*
    * Vaciar el log. Pregunta antes: es lo único destructivo que
    * tiene esta pantalla y no se puede deshacer.
    */

    document

        .getElementById("vaciarLogButton")

        .addEventListener("click", async () => {

            const seguro =
                await Confirm.pedir({

                    titulo: "Vaciar la actividad",

                    texto:
                        "Se borrarán todas las líneas del log. " +
                        "Esto no se puede deshacer.",

                    aceptar: "Vaciar"

                });

            if (!seguro) {

                return;

            }

            Log.vaciar();

            pintarEntidades();

            pintar();

            Toast.mostrar("Actividad vaciada.");

        });

    pintarEntidades();

    pintar();

});
