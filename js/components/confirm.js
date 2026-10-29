/*
|--------------------------------------------------------------------------
| Confirm
|--------------------------------------------------------------------------
|
| La confirmación de la propia aplicación, en lugar del `confirm`
| del navegador.
|
| El cuadro del navegador no se puede vestir, no dice de qué
| aplicación viene y en algunos navegadores permite silenciarlo
| para el resto de la sesión: la siguiente confirmación se daría
| por aceptada sin que nadie la vea. Por eso casi ninguna
| aplicación seria lo usa.
|
| Lleva `role="alertdialog"` y no `dialog`: es una pregunta que
| interrumpe, y así se anuncia. El foco va al botón de cancelar,
| que es la respuesta menos destructiva, y Escape cancela.
|
| Devuelve una promesa. Quien pregunta espera la respuesta, igual
| que con `confirm`, pero sin bloquear el navegador entero.
|
*/

const Confirm = (() => {

    return {

        pedir({ titulo, texto, aceptar = "Aceptar" }) {

            return new Promise(resolver => {

                const fondo =
                    document.createElement("div");

                fondo.className = "modal-overlay";

                fondo.innerHTML = `

<div
    class="modal confirmacion"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirmacionTitulo">

    <h2 id="confirmacionTitulo">${titulo}</h2>

    <p class="confirmacion-texto">${texto}</p>

    <div class="modal-buttons">

        <button
            id="confirmacionCancelar"
            class="btn-cancel"
            type="button">
            Cancelar
        </button>

        <button
            id="confirmacionAceptar"
            class="btn-delete"
            type="button">
            ${aceptar}
        </button>

    </div>

</div>

`;

                document.body.appendChild(fondo);

                const cerrar = respuesta => {

                    fondo.remove();

                    document.removeEventListener("keydown", conTeclado);

                    resolver(respuesta);

                };

                const conTeclado = evento => {

                    if (evento.key === "Escape") {

                        cerrar(false);

                    }

                };

                document.addEventListener("keydown", conTeclado);

                fondo.querySelector("#confirmacionCancelar")
                    .addEventListener("click", () => cerrar(false));

                fondo.querySelector("#confirmacionAceptar")
                    .addEventListener("click", () => cerrar(true));

                /*
                * El foco, en cancelar: es la respuesta que no
                * rompe nada, y así un Intro de más no borra.
                */

                fondo.querySelector("#confirmacionCancelar").focus();

            });

        }

    };

})();
