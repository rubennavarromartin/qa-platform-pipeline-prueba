/*
|--------------------------------------------------------------------------
| Los estados de un proyecto, administrados desde Configuración
|--------------------------------------------------------------------------
|
| Un CRUD pequeño en una pestaña de Configuración. Es el primer **catálogo**
| del laboratorio, y eso es lo que plantea de nuevo: una lista corta que se
| toca una vez y que **manda sobre otra pantalla**.
|
| Lo que se da de alta aquí aparece en el desplegable del formulario de un
| proyecto. Las relaciones que el laboratorio ya tenía —una empresa y sus
| contactos— son entre datos que se crean todos los días; ésta es de las que
| cambian lo que otra pantalla **ofrece**.
|
| Y un negativo que no había: **un estado en uso no se borra**. No es un
| capricho — si se borrara, los proyectos que lo tuvieran se quedarían con un
| estado que no existe. Se dice cuántos lo usan y no se hace, que es lo que
| hace cualquier aplicación seria.
|
*/

const EstadosDeProyecto = (() => {

    function fila(estado) {

        const usos =
            ProjectStatuses.enUso(estado.id);

        return `

<tr>

    <td>${estado.name}</td>

    <td>${estado.description || ""}</td>

    <td>${estado.orden ?? ""}</td>

    <td>${estado.final || "No"}</td>

    <td>${usos}</td>

    <td>

        <div class="action-buttons">

            <button class="btn-edit-status" data-id="${estado.id}">
                Editar
            </button>

            <button class="btn-delete-status" data-id="${estado.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    function pintar(filtro = "") {

        const encontrados =
            filtro
                ? ProjectStatuses.search(filtro)
                : ProjectStatuses.findAll();

        document.querySelector("#statusesGrid tbody").innerHTML =
            encontrados.map(fila).join("");

        /*
        * Y lo que pasa cuando no queda ninguno, dicho donde se lee. Una
        * tabla vacía sin explicación es de las cosas que hacen dudar de si
        * la aplicación ha fallado.
        */

        const aviso =
            document.getElementById("estadosAviso");

        if (aviso) {

            aviso.textContent =
                encontrados.length
                    ? ""
                    : (filtro
                        ? `Ningún estado se llama así.`
                        : "No hay ningún estado. Los proyectos no podrán tener uno.");

        }

        enganchar();

    }

    function formulario(estado = {}) {

        return `

<h2>
    ${estado.id ? "Editar estado" : "Nuevo estado"}
</h2>

<div class="form">

    <label>
        Nombre *
        <input
            id="statusName"
            aria-required="true"
            value="${estado.name || ""}">
    </label>

    <label>
        Descripción
        <input id="statusDescription" value="${estado.description || ""}">
    </label>

    <label>
        Orden
        <input
            id="statusOrden"
            type="number"
            min="1"
            value="${estado.orden ?? ""}">
    </label>

    <label>
        ¿Es un estado final?
        <select id="statusFinal">
            <option ${estado.final === "Sí" ? "selected" : ""}>Sí</option>
            <option ${estado.final !== "Sí" ? "selected" : ""}>No</option>
        </select>
    </label>

</div>

<div class="modal-acciones">

    <button id="saveButton" class="btn-primary">
        Guardar
    </button>

    <button id="cancelButton">
        Cancelar
    </button>

</div>

`;

    }

    function abrir(estado = {}) {

        Modal.open(formulario(estado));

        document
            .getElementById("cancelButton")
            .onclick = () => Modal.close();

        document
            .getElementById("saveButton")
            .onclick = () => {

                const nombre =
                    document.getElementById("statusName").value.trim();

                if (!nombre) {

                    Toast.error("El nombre del estado es obligatorio.");

                    return;

                }

                /*
                * Y que no se repita. Dos estados que se llaman igual no se
                * distinguen en el desplegable de un proyecto, así que quien
                * elija uno no sabrá cuál ha elegido.
                */

                const repetido =
                    ProjectStatuses.findByName(nombre);

                if (repetido && repetido.id !== estado.id) {

                    Toast.error(`Ya hay un estado que se llama "${nombre}".`);

                    return;

                }

                const nuevo = {

                    id: estado.id,

                    name: nombre,

                    description:
                        document.getElementById("statusDescription").value.trim(),

                    orden:
                        Number(document.getElementById("statusOrden").value) || 0,

                    final:
                        document.getElementById("statusFinal").value

                };

                if (estado.id) {

                    ProjectStatuses.update(nuevo);

                }
                else {

                    ProjectStatuses.add(nuevo);

                }

                Modal.close();

                pintar(document.getElementById("searchStatus")?.value || "");

            };

    }

    function enganchar() {

        for (const boton of document.querySelectorAll(".btn-edit-status")) {

            boton.onclick = () => {

                abrir(ProjectStatuses.findById(Number(boton.dataset.id)));

            };

        }

        for (const boton of document.querySelectorAll(".btn-delete-status")) {

            boton.onclick = async () => {

                const estado =
                    ProjectStatuses.findById(Number(boton.dataset.id));

                if (!estado) {

                    return;

                }

                /*
                * Se pregunta antes de mirar si se puede: si no se pudiera,
                * decirlo después de confirmar sería hacer confirmar algo que
                * no iba a pasar.
                */

                const usos =
                    ProjectStatuses.enUso(estado.id);

                if (usos) {

                    Toast.error(
                        `"${estado.name}" no se puede eliminar: lo usan ` +
                        `${usos} ${usos === 1 ? "proyecto" : "proyectos"}.`
                    );

                    return;

                }

                const confirmado =
                    await Confirm.pedir({

                        titulo: "Eliminar",

                        texto: `¿Seguro que quieres eliminar el estado "${estado.name}"?`,

                        aceptar: "Eliminar"

                    });

                if (!confirmado) {

                    return;

                }

                ProjectStatuses.remove(estado.id);

                pintar(document.getElementById("searchStatus")?.value || "");

            };

        }

    }

    return {

        montar() {

            if (!document.getElementById("statusesGrid")) {

                return;

            }

            ProjectStatuses.load();

            if (typeof Projects !== "undefined") {

                Projects.load();

            }

            document
                .getElementById("newStatusButton")
                .onclick = () => abrir();

            document
                .getElementById("searchStatus")
                .addEventListener("input", evento => {

                    pintar(evento.target.value);

                });

            pintar();

        }

    };

})();
