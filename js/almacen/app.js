/*
|--------------------------------------------------------------------------
| Almacén: ventanas en la misma página
|--------------------------------------------------------------------------
|
| Cada botón de la barra abre su ventana en el escritorio, con su pestaña, y
| la dirección no cambia. El porqué, en `almacen.html`.
|
| La ventana se monta después de un instante, como la de la facturación, que
| pide sus datos antes de pintarla: quien la busque al momento de pulsar no
| la encuentra, y tiene que esperar a que aparezca.
|
| Fijas y de sólo lectura: lo que interesa de esta pantalla es cómo se llega
| a cada ventana, no lo que se guarda en ella.
|
*/

(function () {

    const VENTANAS = {

        articulos: {
            titulo: "Artículos",
            buscar: "Buscar artículo",
            columnas: ["Código", "Descripción", "Existencias"],
            filas: [
                ["A-001", "Tornillo hexagonal", "1.200"],
                ["A-002", "Arandela plana", "3.400"],
                ["A-003", "Tuerca autoblocante", "860"],
                ["A-004", "Taco de nailon", "2.150"],
                ["A-005", "Escuadra reforzada", "95"]
            ]
        },

        ubicaciones: {
            titulo: "Ubicaciones",
            buscar: "Buscar ubicación",
            columnas: ["Pasillo", "Estantería", "Uso"],
            filas: [
                ["1", "A", "Tornillería"],
                ["1", "B", "Fijaciones"],
                ["2", "A", "Herrajes"],
                ["3", "C", "Devoluciones"]
            ]
        }

    };

    const pestanas =
        document.getElementById("pestanasAlmacen");

    const escritorio =
        document.getElementById("escritorioAlmacen");

    function activar(clave) {

        for (const p of pestanas.querySelectorAll("[role=tab]")) {

            p.setAttribute("aria-selected", String(p.id === `pestana-${clave}`));

        }

        for (const v of escritorio.querySelectorAll("[role=tabpanel]")) {

            v.hidden = v.id !== `ventana-${clave}`;

        }

    }

    function abrir(clave) {

        if (document.getElementById(`ventana-${clave}`)) {

            activar(clave);

            return;

        }

        const datos =
            VENTANAS[clave];

        const pestana =
            document.createElement("div");

        pestana.setAttribute("role", "tab");
        pestana.id = `pestana-${clave}`;
        pestana.setAttribute("aria-controls", `ventana-${clave}`);
        pestana.textContent = datos.titulo;
        pestana.tabIndex = 0;
        pestana.addEventListener("click", () => activar(clave));

        pestanas.append(pestana);

        const ventana =
            document.createElement("section");

        ventana.setAttribute("role", "tabpanel");
        ventana.id = `ventana-${clave}`;
        ventana.setAttribute("aria-labelledby", pestana.id);
        ventana.style.minHeight = "60vh";

        ventana.innerHTML = `
            <div class="toolbar">
                <div class="toolbar-left">
                    <input id="buscar-${clave}" type="search" placeholder="${datos.buscar}" aria-label="${datos.buscar}">
                </div>
            </div>
            <table id="tabla-${clave}">
                <thead><tr>${datos.columnas.map(c => `<th>${c}</th>`).join("")}</tr></thead>
                <tbody>${datos.filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
            <p class="aviso" role="status" id="vacio-${clave}" hidden>Nada coincide con la búsqueda.</p>
        `;

        const buscar =
            ventana.querySelector("input");

        buscar.addEventListener("input", () => {

            const busca =
                buscar.value.trim().toLowerCase();

            let quedan = 0;

            for (const fila of ventana.querySelectorAll("tbody tr")) {

                const casa =
                    !busca || fila.textContent.toLowerCase().includes(busca);

                fila.hidden = !casa;

                quedan += casa ? 1 : 0;

            }

            ventana.querySelector(`#vacio-${clave}`).hidden = quedan > 0;

        });

        setTimeout(() => {

            escritorio.append(ventana);

            activar(clave);

        }, 250);

    }

    document.getElementById("abrirArticulos").addEventListener("click", () => abrir("articulos"));

    document.getElementById("abrirUbicaciones").addEventListener("click", () => abrir("ubicaciones"));

})();
