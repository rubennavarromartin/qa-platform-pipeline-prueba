/*
|--------------------------------------------------------------------------
| Comments
|--------------------------------------------------------------------------
|
| La pestaña de Comentarios de la ficha de un registro: escribir uno,
| verlos en lista, filtrarlos, ordenarlos y cambiarlos de sitio
| arrastrándolos.
|
| Es el mismo componente en las seis entidades, con su propio almacén
| por registro, igual que la documentación. Un comentario pertenece a
| un cliente concreto, no a "Empresas".
|
| Cada comentario lleva **cuándo** se escribió y **quién** lo
| escribió. El autor no se teclea: lo pone la sesión. Escribiéndolo a
| mano, el mismo usuario podría aparecer con dos nombres distintos y
| la columna no valdría ni para filtrar ni para agrupar.
|
| Ordenar y mover a mano se estorban, y aquí se resuelve así: el
| orden de partida es el que tengan puestos —el que se puede cambiar
| arrastrando— y elegir una columna lo sustituye mientras esté
| elegida. Con un orden puesto no se puede arrastrar, porque
| arrastrar dentro de una lista ordenada por fecha no significa nada:
| el primer repintado desharía el cambio. Se dice en pantalla en
| lugar de dejar que la tarjeta no se mueva sin explicación.
|
| Lo que esto le pone delante a la plataforma: una lista que no es
| una tabla, con su propio buscador y su propia ordenación, dentro
| de una pestaña. Hasta ahora todo lo que se filtraba y se ordenaba
| era la rejilla de la pantalla.
|
*/

const Comments = (() => {

    const ORDENES = {

        puestos: "Como están puestos",

        fecha: "Fecha",

        usuario: "Usuario"

    };

    /*
    * Lo que se está arrastrando, por el mismo motivo que en el
    * kanban: durante el `dragover` no se puede leer el
    * `dataTransfer`.
    */

    let arrastrando = null;

    function clave(modulo, registro) {

        return `qa-platform-comentarios-${modulo}-${registro}`;

    }

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    function cuando(iso) {

        const momento =
            new Date(iso);

        const dos =
            numero => String(numero).padStart(2, "0");

        return (
            `${dos(momento.getDate())}/${dos(momento.getMonth() + 1)}/` +
            `${momento.getFullYear()} ${dos(momento.getHours())}:` +
            `${dos(momento.getMinutes())}`
        );

    }

    function load(modulo, registro) {

        const guardados =
            localStorage.getItem(clave(modulo, registro));

        return guardados
            ? JSON.parse(guardados)
            : [];

    }

    function save(modulo, registro, comentarios) {

        localStorage.setItem(
            clave(modulo, registro),
            JSON.stringify(comentarios)
        );

    }

    function create({ modulo, registro }) {

        const lista =
            document.getElementById("commentsList");

        const texto =
            document.getElementById("commentText");

        const boton =
            document.getElementById("addCommentButton");

        if (!lista || !texto || !boton) {

            return;

        }

        const filtro =
            document.getElementById("commentFilter");

        const orden =
            document.getElementById("commentOrder");

        const sentido =
            document.getElementById("commentDirection");

        const aviso =
            document.getElementById("commentAviso");

        const vacio =
            document.getElementById("commentsVacio");

        let comentarios =
            load(modulo, registro);

        function decir(mensaje, tipo = "ok") {

            if (!aviso) {

                return;

            }

            aviso.textContent = mensaje;

            aviso.className = `aviso ${tipo}`;

        }

        /*
        * Se puede arrastrar sólo cuando no hay orden puesto. Con uno
        * puesto, el sitio de un comentario lo decide la columna y no
        * quien lo arrastra.
        */

        function seMueve() {

            return (orden?.value || "puestos") === "puestos";

        }

        /*
        * Filtrar y ordenar, en ese orden y sin tocar lo guardado.
        *
        * El filtro busca en el texto y en el usuario: "¿qué dijo Ana
        * de esto?" es la pregunta que se hace, y con un buscador que
        * sólo mirara el texto no se podría contestar.
        */

        function visibles() {

            const buscado =
                (filtro?.value || "").trim().toLowerCase();

            const encontrados =
                buscado
                    ? comentarios.filter(comentario =>
                        comentario.text.toLowerCase().includes(buscado)
                        ||
                        comentario.author.toLowerCase().includes(buscado)
                    )
                    : [...comentarios];

            const por =
                orden?.value || "puestos";

            if (por === "puestos") {

                return encontrados;

            }

            const signo =
                sentido?.value === "desc" ? -1 : 1;

            return encontrados.sort((a, b) =>

                por === "fecha"

                    ? signo * String(a.createdAt).localeCompare(String(b.createdAt))

                    : signo * String(a.author).localeCompare(
                        String(b.author),
                        "es",
                        { sensitivity: "base" }
                    )

            );

        }

        function render() {

            const mostrados =
                visibles();

            lista.innerHTML =

                mostrados

                    .map(comentario => `
<li
    class="comentario"
    data-id="${comentario.id}"
    ${seMueve() ? 'draggable="true"' : ""}>

    <div class="comentario-cabecera">

        <span class="comentario-usuario">${escapar(comentario.author)}</span>

        <time
            class="comentario-fecha"
            datetime="${escapar(comentario.createdAt)}">
            ${cuando(comentario.createdAt)}
        </time>

    </div>

    <p class="comentario-texto">${escapar(comentario.text)}</p>

    <div class="comentario-acciones">

        <button
            type="button"
            class="btn-comment-delete"
            data-id="${comentario.id}">
            🗑 Eliminar
        </button>

    </div>

</li>`)

                    .join("");

            if (vacio) {

                vacio.textContent =
                    comentarios.length
                        ? "Ningún comentario coincide con el filtro."
                        : "Todavía no hay comentarios.";

                vacio.hidden = mostrados.length > 0;

            }

            const nota =
                document.getElementById("commentsMoverNota");

            if (nota) {

                nota.hidden = seMueve();

            }

            enganchar();

        }

        function enganchar() {

            lista

                .querySelectorAll(".btn-comment-delete")

                .forEach(button => {

                    button.onclick = async () => {

                        const comentario =
                            comentarios.find(c => c.id == button.dataset.id);

                        if (!comentario) {

                            return;

                        }

                        const confirmado =
                            await Confirm.pedir({

                                titulo: "Eliminar comentario",

                                texto:
                                    "¿Seguro que quieres eliminar este comentario?",

                                aceptar: "Eliminar"

                            });

                        if (!confirmado) {

                            return;

                        }

                        comentarios =
                            comentarios.filter(c => c.id != comentario.id);

                        save(modulo, registro, comentarios);

                        render();

                        decir("Comentario eliminado.");

                    };

                });

            if (!seMueve()) {

                return;

            }

            lista

                .querySelectorAll(".comentario")

                .forEach(nodo => {

                    nodo.addEventListener("dragstart", evento => {

                        arrastrando = nodo.dataset.id;

                        nodo.classList.add("arrastrando");

                        evento.dataTransfer.effectAllowed = "move";

                        evento.dataTransfer.setData(
                            "text/plain",
                            nodo.dataset.id
                        );

                    });

                    nodo.addEventListener("dragend", () => {

                        nodo.classList.remove("arrastrando");

                        arrastrando = null;

                    });

                    nodo.addEventListener("dragover", evento => {

                        if (!arrastrando || arrastrando === nodo.dataset.id) {

                            return;

                        }

                        evento.preventDefault();

                        nodo.classList.add("comentario-recibe");

                    });

                    nodo.addEventListener("dragleave", () => {

                        nodo.classList.remove("comentario-recibe");

                    });

                    nodo.addEventListener("drop", evento => {

                        evento.preventDefault();

                        nodo.classList.remove("comentario-recibe");

                        const movido =
                            arrastrando
                            || evento.dataTransfer.getData("text/plain");

                        if (!movido || movido === nodo.dataset.id) {

                            return;

                        }

                        colocar(movido, nodo.dataset.id);

                    });

                });

        }

        /*
        * Poner un comentario donde está otro.
        *
        * Se saca de su sitio y se mete en el del destino. Calculando
        * el destino antes de sacarlo, el índice se desplaza cuando se
        * mueve hacia abajo y el comentario acaba una posición más
        * arriba de donde se soltó.
        */

        function colocar(movidoId, destinoId) {

            const desde =
                comentarios.findIndex(c => c.id == movidoId);

            if (desde < 0) {

                return;

            }

            const [comentario] =
                comentarios.splice(desde, 1);

            const hasta =
                comentarios.findIndex(c => c.id == destinoId);

            comentarios.splice(
                hasta < 0 ? comentarios.length : hasta,
                0,
                comentario
            );

            save(modulo, registro, comentarios);

            render();

            decir("Comentario movido.");

        }

        boton.addEventListener("click", () => {

            const escrito =
                texto.value.trim();

            if (!escrito) {

                decir("Escribe algo antes de comentar.", "error");

                return;

            }

            comentarios = [

                ...comentarios,

                {

                    id: Date.now(),

                    text: escrito,

                    author: Session.usuario(),

                    createdAt: new Date().toISOString()

                }

            ];

            save(modulo, registro, comentarios);

            texto.value = "";

            render();

            decir("Comentario añadido.");

        });

        filtro?.addEventListener("input", render);

        orden?.addEventListener("change", render);

        sentido?.addEventListener("change", render);

        render();

    }

    return {

        ORDENES,

        create

    };

})();
