/*
|--------------------------------------------------------------------------
| El listado de proyectos
|--------------------------------------------------------------------------
|
| Una fila por proyecto, con su empresa, su estado y su avance.
|
| El avance se enseña con el número delante y la barra detrás, y no al revés:
| lo que se puede comprobar es el número. Una prueba que mirara el ancho de un
| `div` estaría comprobando el dibujo, que es justo lo que este proyecto no
| hace con las gráficas.
|
*/

const ProjectUI = (() => {

    function renderRow(proyecto) {

        const empresa =
            Projects.empresaDe(proyecto);

        const estado =
            Projects.estadoDe(proyecto);

        return `

<tr>

    <td>
        <a
            class="ficha"
            href="projects.html?id=${proyecto.id}">
            ${proyecto.name}
        </a>
    </td>

    <td>${empresa}</td>

    <td>${Badge.status(estado)}</td>

    <td>${proyecto.dueDate || ""}</td>

    <td class="celda-avance">

        <span class="avance-numero">${proyecto.avance ?? 0}%</span>

        <span class="barra barra-fina" aria-hidden="true">
            <span
                class="barra-relleno"
                style="width:${proyecto.avance ?? 0}%"></span>
        </span>

    </td>

    <td>

        <div class="action-buttons">

            <button
                class="btn-delete"
                data-id="${proyecto.id}">
                🗑 Eliminar
            </button>

        </div>

    </td>

</tr>

`;

    }

    function bindEvents() {

        document
            .querySelectorAll("#projectsGrid .btn-delete")
            .forEach(boton => {

                boton.onclick = async () => {

                    const id =
                        Number(boton.dataset.id);

                    const proyecto =
                        Projects.findById(id);

                    if (!proyecto) {

                        return;

                    }

                    /*
                    * Con sus tareas dentro, se avisa de cuántas se van con
                    * él. No se impide —un proyecto cancelado hay que poder
                    * borrarlo— pero decirlo antes es lo que separa un
                    * borrado de un descuido.
                    */

                    const tareas =
                        typeof Tasks !== "undefined"
                            ? Tasks.findByProject(id).length
                            : 0;

                    const confirmado =
                        await Confirm.pedir({

                            titulo: "Eliminar",

                            texto:
                                tareas
                                    ? `¿Seguro que quieres eliminar el proyecto "${proyecto.name}"? Se irán con él ${tareas} ${tareas === 1 ? "tarea" : "tareas"}.`
                                    : `¿Seguro que quieres eliminar el proyecto "${proyecto.name}"?`,

                            /*
                            * "Quitar" y no "Eliminar": una palabra que la
                            * plataforma no busca, como el "Excluir" de SABESP.
                            */

                            aceptar: "Quitar"

                        });

                    if (!confirmado) {

                        return;

                    }

                    Projects.remove(id);

                    CrudPage.pintar();

                };

            });

    }

    return {

        renderTable(proyectos) {

            DataTable.render(
                "#projectsGrid tbody",
                proyectos.map(renderRow)
            );

            bindEvents();

        }

    };

})();
