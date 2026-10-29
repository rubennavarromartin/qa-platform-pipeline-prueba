/*
|--------------------------------------------------------------------------
| Aprobaciones
|--------------------------------------------------------------------------
|
| La pantalla de decidir: aprobar o rechazar lo que otro ha pedido.
|
| No usa CrudPage —que es lo que monta las demás— porque aquí no
| hay ningún CRUD: no se da de alta una solicitud ni se edita, y
| no se borra ninguna. Lo único que se hace es decidir, y decidir
| son dos botones por fila.
|
| Lo que comparte con las demás listas es el buscador, el filtro
| y la paginación, y ésos sí se reutilizan.
|
| Los botones desaparecen en cuanto la solicitud deja de estar
| pendiente. No se desactivan: una solicitud resuelta no tiene
| nada que decidir, y un botón apagado invita a preguntarse por
| qué. Y de paso deja el mismo caso que el kanban y las filas que
| se colocan — un control que está o no está según el estado de
| su fila —.
|
*/

document.addEventListener("DOMContentLoaded", () => {

    const cuerpo =
        document.querySelector("#approvalsGrid tbody");

    const vacio =
        document.getElementById("approvalsVacio");

    const filtroEstado =
        document.getElementById("filtroEstado");

    const buscador =
        document.getElementById("search");

    if (!cuerpo) {

        return;

    }

    Aprobaciones.load();

    const paginacion =
        Pagination.crear({

            id: "paginacion",

            onCambio: pintar

        });

    function escapar(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

    function loQueSeVe() {

        const encontradas =
            Aprobaciones.search(buscador?.value);

        return filtroEstado?.value
            ? encontradas.filter(una => una.estado === filtroEstado.value)
            : encontradas;

    }

    function fila(una) {

        const pendiente =
            una.estado === Aprobaciones.PENDIENTE;

        return `

<tr>

    <td>${escapar(una.codigo)}</td>

    <td>${escapar(una.solicitante)}</td>

    <td>${escapar(una.presupuesto)}</td>

    <td>${escapar(una.descuento)} %</td>

    <td>${Badge.status(una.estado)}</td>

    <td>

        <div class="action-buttons">
${
    pendiente
        ? `
            <button
                class="btn-primary btn-aprobar"
                data-id="${escapar(una.id)}">
                Aprobar
            </button>

            <button
                class="btn-delete btn-rechazar"
                data-id="${escapar(una.id)}">
                Rechazar
            </button>`
        : ""
}
        </div>

    </td>

</tr>

`;

    }

    function pintar() {

        const encontradas =
            loQueSeVe();

        const visibles =
            paginacion
                ? paginacion.recortar(encontradas)
                : encontradas;

        cuerpo.innerHTML =
            visibles.map(fila).join("");

        if (vacio) {

            vacio.textContent =
                encontradas.length
                    ? ""
                    : "No hay ninguna solicitud que responda a eso.";

        }

    }

    /*
    * Se escucha en el cuerpo de la tabla y no en cada botón: las
    * filas se vuelven a escribir enteras cada vez que se busca,
    * se filtra o se pasa de página.
    */

    cuerpo.addEventListener("click", evento => {

        const boton =
            evento.target.closest("[data-id]");

        if (!boton) {

            return;

        }

        const estado =
            boton.classList.contains("btn-aprobar")
                ? Aprobaciones.APROBADA
                : Aprobaciones.RECHAZADA;

        if (!Aprobaciones.decidir(boton.dataset.id, estado)) {

            return;

        }

        if (typeof Toast !== "undefined") {

            Toast.mostrar(`Solicitud ${estado.toLowerCase()}.`, "ok");

        }

        pintar();

    });

    buscador?.addEventListener("input", pintar);

    filtroEstado?.addEventListener("change", pintar);

    pintar();

});
