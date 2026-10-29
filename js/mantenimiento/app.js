/*
|--------------------------------------------------------------------------
| Mantenimiento: las tareas de cada noche
|--------------------------------------------------------------------------
|
| Fijas y de sólo lectura: lo que interesa de esta pantalla es la puerta que
| tiene delante, y lo de detrás está para que salgan pruebas que la crucen.
| El buscador esconde las filas que no casan, como el resto del laboratorio.
|
*/

(function () {

    const TAREAS = [

        ["Copia de seguridad", "Cada noche", "Hoy, 02:00", "Hecha"],
        ["Limpiar evidencias antiguas", "Cada semana", "Lunes, 03:00", "Hecha"],
        ["Recalcular cifras del panel", "Cada noche", "Hoy, 02:30", "Hecha"],
        ["Avisar de presupuestos caducados", "Cada mañana", "Hoy, 08:00", "Con avisos"],
        ["Comprobar direcciones de correo", "Cada semana", "Domingo, 04:00", "Fallida"],
        ["Archivar actividad de más de un año", "Cada mes", "Día 1, 05:00", "Hecha"]

    ];

    const cuerpo =
        document.querySelector("#tablaTareas tbody");

    cuerpo.innerHTML =
        TAREAS.map(fila =>
            `<tr>${fila.map(celda => `<td>${celda}</td>`).join("")}</tr>`
        ).join("");

    const buscar =
        document.getElementById("buscarTarea");

    buscar.addEventListener("input", () => {

        const busca =
            buscar.value.trim().toLowerCase();

        let quedan = 0;

        for (const fila of cuerpo.querySelectorAll("tr")) {

            const casa =
                !busca || fila.textContent.toLowerCase().includes(busca);

            fila.hidden = !casa;

            quedan += casa ? 1 : 0;

        }

        document.getElementById("tareasVacio").hidden = quedan > 0;

    });

})();
