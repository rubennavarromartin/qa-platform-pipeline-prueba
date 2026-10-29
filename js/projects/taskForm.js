/*
|--------------------------------------------------------------------------
| El formulario de una tarea
|--------------------------------------------------------------------------
|
| Se abre desde la ficha de un proyecto y la tarea nace colgada de él: el
| proyecto no se elige, viene dado. Es el caso de "crear colgado de otro
| registro" que los casos de uso ya encadenan, y aquí se plantea dentro de una
| ficha en lugar de desde un listado.
|
| Avisa a quien lo abrió cuando se guarda, con la función que le pasen. Sin
| eso, la ficha no tendría manera de enterarse: guardar y cancelar cierran el
| diálogo igual.
|
*/

const TaskForm = (() => {

    function columnaOptions(elegida) {

        return Tasks.COLUMNAS

            .map(columna => `
                <option ${columna === elegida ? "selected" : ""}>
                    ${columna}
                </option>`)

            .join("");

    }

    function html(tarea) {

        return `

<h2>
    ${tarea.id ? "Editar tarea" : "Nueva tarea"}
</h2>

<div class="form">

    <label>
        Título *
        <input
            id="taskTitle"
            aria-required="true"
            value="${tarea.title || ""}">
    </label>

    <label>
        Columna *
        <select id="taskEstado" aria-required="true">
${columnaOptions(tarea.estado || Tasks.COLUMNAS[0])}
        </select>
    </label>

    <label>
        Área
        <input id="taskArea" value="${tarea.area || ""}">
    </label>

    <label>
        Fecha
        <input id="taskFecha" type="date" value="${tarea.fecha || ""}">
    </label>

    <label>
        Iniciales
        <input id="taskQuien" maxlength="2" value="${tarea.quien || ""}">
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

    return {

        open(tarea = {}, alGuardar = null) {

            Modal.open(html(tarea));

            document
                .getElementById("cancelButton")
                .onclick = () => Modal.close();

            document
                .getElementById("saveButton")
                .onclick = () => {

                    const nueva = {

                        id: tarea.id,

                        projectId: tarea.projectId,

                        title:
                            document.getElementById("taskTitle").value.trim(),

                        estado:
                            document.getElementById("taskEstado").value,

                        area:
                            document.getElementById("taskArea").value.trim(),

                        fecha:
                            document.getElementById("taskFecha").value,

                        quien:
                            document.getElementById("taskQuien").value.trim().toUpperCase()

                    };

                    if (!nueva.title) {

                        Toast.error("El título de la tarea es obligatorio.");

                        return;

                    }

                    if (nueva.id) {

                        Tasks.update(nueva);

                    }
                    else {

                        Tasks.add(nueva);

                    }

                    Modal.close();

                    if (alGuardar) {

                        alGuardar();

                    }

                };

        }

    };

})();
