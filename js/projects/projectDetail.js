/*
|--------------------------------------------------------------------------
| La ficha de un proyecto
|--------------------------------------------------------------------------
|
| Un panel, no una lista de datos: las cifras arriba, el tablero de tareas, la
| documentación al lado y las próximas citas debajo. Y a la izquierda, su
| propio menú de secciones.
|
| Lo que plantea, y por qué cada cosa
|
|   **Dos menús en la misma pantalla.** El de la aplicación, a la izquierda
|   del todo, y el del proyecto, dentro. El de dentro **no navega**: cambia el
|   panel de al lado sin tocar la dirección. Hasta ahora el laboratorio sólo
|   tenía pestañas para eso, y una pestaña se declara con `role="tab"`; esto
|   es un `nav` con `aria-current`, que es la otra forma correcta de decir lo
|   mismo. Si la plataforma sólo sabe leer la primera, aquí se verá.
|
|   **Una barra de progreso.** Con su `role="progressbar"` y sus valores. Lo
|   que se puede comprobar es el número que tiene al lado, no el ancho del
|   relleno — de un dibujo no se lee ningún dato, igual que de una gráfica. La
|   barra está para que la pregunta se pueda plantear.
|
|   **Dos "En curso" que no son lo mismo.** Uno es el estado del proyecto y
|   otro una columna del tablero. Quien lea la pantalla por su texto los
|   juntará.
|
|   **Y una sección vacía a propósito**: un proyecto sin tareas enseña el
|   tablero con sus tres columnas a cero. Una pantalla que no dice nada cuando
|   no hay datos es de las cosas que sólo se ven cuando ya han costado algo.
|
*/

const ProjectDetail = (() => {

    /*
    * Documentos de ejemplo. No son un CRUD: la documentación de verdad ya la
    * plantea la pestaña de Documentación de Empresas y Contactos, y repetir
    * el mismo caso no pregunta nada nuevo. Aquí son una lista que leer.
    */

    const DOCUMENTOS = [

        { nombre: "Brief del proyecto", apunte: "Actualizado hoy" },

        { nombre: "Decisiones de producto", apunte: "8 comentarios" },

        { nombre: "Guía de marca", apunte: "PDF · 2,4 MB" }

    ];

    function pedida() {

        return new URLSearchParams(location.search).has("id");

    }

    function cual() {

        return Number(
            new URLSearchParams(location.search).get("id")
        );

    }

    function tarjetaDeTarea(tarea) {

        return `
            <article class="tarjeta-tarea" data-id="${tarea.id}">

                <h3>${tarea.title}</h3>

                <p class="tarjeta-tarea-pie">

                    <span>${tarea.fecha || ""} · ${tarea.area || ""}</span>

                    <span class="avatar" aria-label="Asignada a ${tarea.quien || "nadie"}">${tarea.quien || "--"}</span>

                </p>

                <div class="tarjeta-tarea-mover">

                    <button
                        class="btn-mover"
                        data-id="${tarea.id}"
                        data-hacia="anterior"
                        aria-label="Mover &quot;${tarea.title}&quot; a la columna anterior">‹</button>

                    <button
                        class="btn-mover"
                        data-id="${tarea.id}"
                        data-hacia="siguiente"
                        aria-label="Mover &quot;${tarea.title}&quot; a la columna siguiente">›</button>

                </div>

            </article>`;

    }

    /*
    * El tablero de un proyecto.
    *
    * Las columnas se pintan siempre las tres, tenga tareas o no: una columna
    * que desaparece cuando se vacía hace que la pantalla cambie de forma, y
    * entonces no se puede afirmar nada de ella.
    */

    function pintarTablero(donde, projectId) {

        const columnas =
            Tasks.COLUMNAS.map(columna => {

                const suyas =
                    Tasks.findByColumna(projectId, columna);

                return `
                    <section class="columna" data-columna="${columna}">

                        <header class="columna-cabecera">

                            <span class="columna-nombre">${columna}</span>

                            <span class="columna-cuenta">${suyas.length}</span>

                        </header>

                        ${suyas.map(tarjetaDeTarea).join("")}

                    </section>`;

            });

        document.querySelector(donde).innerHTML = columnas.join("");

    }

    function pintarDocumentos(donde) {

        document.querySelector(donde).innerHTML =
            DOCUMENTOS.map(documento => `
                <li>
                    <span class="documento-nombre">${documento.nombre}</span>
                    <span class="documento-apunte">${documento.apunte}</span>
                </li>`).join("");

    }

    /*
    * Las próximas citas del proyecto.
    *
    * Salen de la Agenda si está cargada, y si no, de una lista corta. Se
    * enseñan las dos primeras que no hayan pasado.
    */

    function pintarAgenda(donde, proyecto) {

        const citas = [

            { cuando: "HOY", hora: "16:00", que: "Revisión de sprint", quien: "Equipo de producto · 30 min" },

            { cuando: "JUE", hora: "10:30", que: "Sesión con cliente", quien: "Presentación del prototipo" }

        ];

        document.querySelector(donde).innerHTML =
            citas.map(cita => `
                <li>
                    <span class="cita-cuando">
                        <strong>${cita.cuando}</strong>
                        <span>${cita.hora}</span>
                    </span>
                    <span class="cita-que">
                        <strong>${cita.que}</strong>
                        <span>${cita.quien}</span>
                    </span>
                </li>`).join("");

    }

    /*
    * El equipo, deducido de quién tiene tareas.
    *
    * No hay un catálogo de personas: se sacan de las tareas, que es de donde
    * salen de verdad. Así la tabla dice algo que se puede comprobar —cuántas
    * tareas tiene cada uno— en lugar de ser una lista escrita a mano.
    */

    function pintarEquipo(projectId) {

        const suyas =
            Tasks.findByProject(projectId);

        const porPersona =
            new Map();

        for (const tarea of suyas) {

            const quien =
                tarea.quien || "--";

            if (!porPersona.has(quien)) {

                porPersona.set(quien, { area: tarea.area || "", cuantas: 0 });

            }

            porPersona.get(quien).cuantas++;

        }

        document.querySelector("#equipoGrid tbody").innerHTML =
            [...porPersona.entries()].map(([quien, datos]) => `
                <tr>
                    <td><span class="avatar">${quien}</span></td>
                    <td>${datos.area}</td>
                    <td>${datos.cuantas}</td>
                </tr>`).join("");

    }

    /*
    * Qué sección pide la dirección.
    *
    * Las secciones se pueden enlazar —`projects.html?id=1#equipo`— y eso no
    * es un adorno: es lo que permite que una cifra del resumen **lleve** a su
    * sección en lugar de limitarse a cambiarla, y lo que hace que se pueda
    * volver a ella. Sin hash, Resumen.
    */

    function laQuePideLaDireccion() {

        const pedida =
            (location.hash || "").replace("#", "");

        return SECCIONES.includes(pedida)
            ? pedida
            : "resumen";

    }

    const SECCIONES = [
        "resumen",
        "tareas",
        "agenda",
        "equipo",
        "documentacion"
    ];

    function abrirSeccion(cual) {

        for (const boton of document.querySelectorAll(".proyecto-seccion")) {

            const suya =
                boton.dataset.seccion === cual;

            if (suya) {

                boton.setAttribute("aria-current", "page");

            }
            else {

                boton.removeAttribute("aria-current");

            }

        }

        const paneles = {

            resumen: "seccionResumen",

            tareas: "seccionTareas",

            agenda: "seccionAgenda",

            equipo: "seccionEquipo",

            documentacion: "seccionDocumentacion"

        };

        for (const [nombre, id] of Object.entries(paneles)) {

            document.getElementById(id).hidden = nombre !== cual;

        }

    }

    function pintar(proyecto) {

        document.getElementById("fichaTitulo").textContent =
            proyecto.name;

        document.getElementById("fichaMigaNombre").textContent =
            proyecto.name;

        document.getElementById("proyectoMenuNombre").textContent =
            proyecto.name;

        document.getElementById("fichaSubtitulo").textContent =
            `Entrega prevista: ${proyecto.dueDate || "sin fecha"} · Propietaria: ${proyecto.owner || "sin asignar"}`;

        document.getElementById("cifraAvance").textContent =
            `${proyecto.avance ?? 0}%`;

        document.getElementById("cifraEstado").textContent =
            Projects.estadoDe(proyecto);

        document.getElementById("cifraEquipo").textContent =
            `${proyecto.equipo ?? 0} ${proyecto.equipo === 1 ? "persona" : "personas"}`;

        document.getElementById("cifraDocumentos").textContent =
            `${DOCUMENTOS.length} ${DOCUMENTOS.length === 1 ? "documento" : "documentos"}`;

        const barra =
            document.getElementById("barraAvance");

        barra.setAttribute("aria-valuenow", proyecto.avance ?? 0);

        barra.setAttribute(
            "aria-label",
            `Progreso del proyecto: ${proyecto.avance ?? 0} por ciento`
        );

        document.getElementById("barraAvanceRelleno").style.width =
            `${proyecto.avance ?? 0}%`;

        pintarTablero("#tableroResumen", proyecto.id);

        pintarTablero("#tableroTareas", proyecto.id);

        pintarDocumentos("#documentacionResumen");

        pintarDocumentos("#documentacionProyecto");

        pintarAgenda("#proximamente", proyecto);

        pintarAgenda("#agendaProyecto", proyecto);

        pintarEquipo(proyecto.id);

    }

    return {

        pedida,

        create() {

            document.getElementById("vistaListado").hidden = true;

            document.getElementById("vistaFicha").hidden = false;

            Projects.load();

            Tasks.load();

            ProjectStatuses.load();

            if (typeof Companies !== "undefined") {

                Companies.load();

            }

            const proyecto =
                Projects.findById(cual());

            if (!proyecto) {

                document.getElementById("fichaNoExiste").hidden = false;

                document.getElementById("fichaProyecto").hidden = true;

                return;

            }

            pintar(proyecto);

            document
                .getElementById("fichaVolver")
                .onclick = () => {

                    location.href = "projects.html";

                };

            /*
            * El menú del proyecto, delegado en el `nav`: los paneles se
            * repintan y un manejador por botón se perdería.
            */

            document
                .getElementById("proyectoMenu")
                .addEventListener("click", evento => {

                    const boton =
                        evento.target.closest(".proyecto-seccion");

                    if (boton) {

                        location.hash = boton.dataset.seccion;

                    }

                });

            /*
            * Y las cifras del resumen que son accesos.
            *
            * Cambian el hash, igual que el menú: así lo que hace el botón es
            * **ir a un sitio**, no sólo enseñar otra cosa. Se escucha en el
            * cuerpo de la ficha y no en cada tarjeta, porque el resumen se
            * repinta al mover una tarea.
            */

            document
                .getElementById("fichaProyecto")
                .addEventListener("click", evento => {

                    const acceso =
                        evento.target.closest(".tarjeta-cifra-acceso");

                    if (acceso) {

                        location.hash = acceso.dataset.seccion;

                    }

                });

            /*
            * Y la dirección manda: al cargar y cada vez que cambie el hash.
            * Sin lo segundo, el botón de atrás del navegador cambiaría la
            * dirección y la pantalla se quedaría enseñando otra cosa — que es
            * justo el fallo que la clase VOLVER_ATRAS viene a cazar.
            */

            abrirSeccion(laQuePideLaDireccion());

            window.addEventListener("hashchange", () => {

                abrirSeccion(laQuePideLaDireccion());

            });

            /*
            * Mover una tarea de columna. Se escucha en los dos tableros con
            * un solo manejador puesto en el cuerpo de la ficha: son el mismo
            * gesto y sería la misma función dos veces.
            */

            document
                .getElementById("fichaProyecto")
                .addEventListener("click", evento => {

                    const boton =
                        evento.target.closest(".btn-mover");

                    if (!boton) {

                        return;

                    }

                    const movida =
                        Tasks.mover(
                            Number(boton.dataset.id),
                            boton.dataset.hacia
                        );

                    if (movida) {

                        pintar(Projects.findById(cual()));

                    }

                });

            document
                .getElementById("nuevaTareaButton")
                .onclick = () => {

                    TaskForm.open({ projectId: proyecto.id }, () => {

                        pintar(Projects.findById(cual()));

                    });

                };

        }

    };

})();
