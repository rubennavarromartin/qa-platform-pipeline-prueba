/*
|--------------------------------------------------------------------------
| La puerta de Mantenimiento
|--------------------------------------------------------------------------
|
| Tapa la pantalla al cargar hasta que se contesta bien una pregunta. El
| porqué de que exista está en `mantenimiento.html`.
|
| Tres cosas a propósito, las tres para que pasarla pida entender la
| pregunta y no saberse la forma:
|
| - La respuesta se escribe en un campo y se confirma con un botón.
| - Las preguntas no son cuentas, y se eligen al azar.
| - Fallar cambia la pregunta.
|
| Y una por la que las pruebas la notan: se acuerda de que está abierta en
| `sessionStorage`, que es de la pestaña. Una prueba arranca con un
| navegador limpio, así que se la encuentra cerrada siempre.
|
*/

(function () {

    const CLAVE = "crm-mantenimiento-abierta";

    const PREGUNTAS = [

        { texto: "¿Cuántas letras tiene la palabra «empresa»?", respuesta: "7" },
        { texto: "Escribe con cifras el número que va después de diecinueve.", respuesta: "20" },
        { texto: "¿Cuántas patas tienen, entre los dos, un gato y una gallina?", respuesta: "6" },
        { texto: "Escribe con cifras: trescientos doce.", respuesta: "312" },
        { texto: "¿Cuántos días tienen dos semanas?", respuesta: "14" },
        { texto: "¿Cuántas vocales tiene la palabra «contacto»?", respuesta: "3" }

    ];

    function abierta() {

        try { return sessionStorage.getItem(CLAVE) === "si"; } catch { return false; }

    }

    function otra(menos) {

        let una;

        do {

            una = PREGUNTAS[Math.floor(Math.random() * PREGUNTAS.length)];

        } while (una === menos);

        return una;

    }

    function cerrar() {

        const principal =
            document.getElementById("vistaListado");

        principal.inert = true;

        const capa =
            document.createElement("div");

        capa.className = "modal-overlay";

        capa.innerHTML =
            `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="puertaTitulo">` +
                `<h2 id="puertaTitulo">Zona de mantenimiento</h2>` +
                `<p id="puertaPregunta"></p>` +
                `<form class="form" id="puertaFormulario">` +
                    `<label for="puertaRespuesta">Respuesta</label>` +
                    `<input id="puertaRespuesta" type="text" autocomplete="off">` +
                    `<p class="aviso" id="puertaFallo" role="alert"></p>` +
                    `<div class="modal-buttons">` +
                        `<a href="index.html">Volver al inicio</a>` +
                        `<button type="submit" class="btn btn-primary">Continuar</button>` +
                    `</div>` +
                `</form>` +
            `</div>`;

        document.body.appendChild(capa);

        let actual = otra(null);

        const pintar = () => {

            capa.querySelector("#puertaPregunta").textContent = actual.texto;

        };

        pintar();

        capa.querySelector("#puertaFormulario").addEventListener("submit", evento => {

            evento.preventDefault();

            const campo =
                capa.querySelector("#puertaRespuesta");

            if (campo.value.trim() === actual.respuesta) {

                try { sessionStorage.setItem(CLAVE, "si"); } catch { /* se preguntará otra vez */ }

                capa.remove();

                principal.inert = false;

                return;

            }

            actual = otra(actual);

            campo.value = "";

            capa.querySelector("#puertaFallo").textContent = "No es eso. Prueba con esta otra.";

            pintar();

        });

    }

    if (!abierta()) {

        cerrar();

    }

})();
